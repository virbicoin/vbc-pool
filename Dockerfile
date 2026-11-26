# Build stage (go.mod needs Go 1.25+; CI builds with 1.26)
FROM golang:1.26-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build arguments
ARG VERSION=dev
ARG COMMIT=unknown
ARG BUILD_TIME=unknown

# Build the binary (pure Go, like CI and the production builds)
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags "-s -w -X main.Version=${VERSION} -X main.Commit=${COMMIT} -X main.BuildTime=${BUILD_TIME}" \
    -trimpath \
    -o vbc-pool .

# Runtime stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1000 -S pooluser && \
    adduser -u 1000 -S pooluser -G pooluser

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/vbc-pool .

# Copy config template
COPY --from=builder /app/config.example.json ./config.example.json

# Change ownership
RUN chown -R pooluser:pooluser /app

# Switch to non-root user
USER pooluser

# Expose ports (config.example.json: proxy 8888, stratum 8008, api 8080)
EXPOSE 8888 8008 8080

# Health check: the stratum port of config.example.json (busybox sh has no /dev/tcp)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD nc -z 127.0.0.1 8008 || exit 1

# Default command
CMD ["./vbc-pool", "config.json"] 