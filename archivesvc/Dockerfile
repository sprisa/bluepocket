FROM --platform=$BUILDPLATFORM golang:1.24.5-bullseye AS build
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG BUILD_FILE_DIR=.
ARG BUILD_FILE_NAME

RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM" > /log

# Install ca-certs so go ssl works correctly
# https://github.com/golang/go/issues/35702#issuecomment-557632968
RUN apt-get update \
  && apt-get install -y ca-certificates \
  && update-ca-certificates

# Copy over files
WORKDIR /app
COPY . .

RUN echo "Build at $BUILD_FILE_DIR for $BUILD_FILE_NAME" > /log
RUN --mount=type=cache,target=/go/pkg if [ "$BUILD_FILE_NAME" = "null" ] ; then /app/build.sh ./${BUILD_FILE_DIR} ; else /app/build.sh ${BUILD_FILE_DIR}/${BUILD_FILE_NAME} ; fi

# Copy over build artifacts
FROM gcr.io/distroless/static-debian12

# Copy over ca certs
COPY --from=build /etc/ca-certificates /etc/ca-certificates
COPY --from=build /etc/ca-certificates.conf /etc/ca-certificates.conf
COPY --from=build /etc/ssl /etc/ssl

WORKDIR /app
COPY --from=build /app/app ./app

CMD ["./app"]
