package l

import (
	"github.com/rs/zerolog"
)

var Log zerolog.Logger

func init() {
	writer := zerolog.NewConsoleWriter()
	// Unix formatter is smaller and faster
	// writer.TimeFormat = zerolog.TimeFormatUnix
	Log = zerolog.New(writer)
}
