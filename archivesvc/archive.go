package main

import (
	"archivesvc/util/errutil"
	l "archivesvc/util/logger"
	"archivesvc/util/sig"
	"context"
	"errors"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path"
	"strings"
	"time"
)

func main() {
	ctx := sig.ShutdownContext(context.Background())
	archiveUrl, err := url.Parse("https://web.archive.org")
	errutil.InvariantError(err, "error building archive url")

	proxy := httputil.NewSingleHostReverseProxy(archiveUrl)
	proxy.ModifyResponse = func(res *http.Response) error {
		// Handle redirects
		if res.StatusCode >= http.StatusMultipleChoices &&
			res.StatusCode <= http.StatusPermanentRedirect {
			location := res.Header.Get("location")
			if location == "" {
				return nil
			}
			// l.Log.Info().
			// 	Str("location", location).
			// 	Msgf("Redirect: %v", res.StatusCode)
			location = "http://localhost:3001?p=" + strings.Replace(location, "https://web.archive.org", "", 1)
			// l.Log.Info().Msgf("newLocation: %v", location)
			res.Header.Set("location", location)
		}

		// Set content base for relative links
		res.Header.Set("Content-Base", "https://web.archive.org")
		return nil
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		// CORS
		origin := req.Header.Get("origin")
		if origin == "" {
			origin = "*"
		}
		// l.Log.Info().Msgf("REQ: %s | METHOD: %s | ORIGIN: %s", req.URL.String(), req.Method, origin)
		res.Header().Set("Access-Control-Allow-Origin", origin)
		res.Header().Set("Access-Control-Allow-Methods", "GET")
		if req.Method == "OPTIONS" {
			res.WriteHeader(http.StatusNoContent)
			return
		}
		if req.Method != "GET" {
			res.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		docPath := req.URL.Query().Get("p")
		if docPath == "" {
			res.WriteHeader(http.StatusBadRequest)
			return
		}

		ext := path.Ext(req.URL.Path)
		// Redirect relative asset links to wayback archive.
		// Only handle documents.
		if ext != "" {
			url := "https://web.archive.org" + req.URL.String()
			http.Redirect(res, req, url, http.StatusMovedPermanently)
			return
		}

		// l.Log.Info().Msgf("Proxying request for: %s to %s%s", req.URL.Path, archiveUrl.Host, req.URL.Path)
		req.URL.Scheme = archiveUrl.Scheme
		req.URL.Host = archiveUrl.Host
		req.URL.Path = docPath
		query := req.URL.Query()
		query.Del("p")
		req.URL.RawQuery = query.Encode()
		req.Host = archiveUrl.Host

		// l.Log.Info().Msgf("SENDING QUERY: %+v", req.URL.String())


		proxy.ServeHTTP(res, req)
	})

	srv := http.Server{Addr: ":3001", Handler: mux}
	go func() {
		<-ctx.Done()
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
		defer cancel()
		err := srv.Shutdown(ctx)
		l.Log.Err(err).Msg("Server shutdown")
	}()

	l.Log.Info().Msgf("Server up at http://localhost%s", srv.Addr)
	err = srv.ListenAndServe()
	if err != nil && errors.Is(err, http.ErrServerClosed) == false {
		l.Log.Err(err).Msg("error starting server")
	}
}