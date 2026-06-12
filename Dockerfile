# Build stage
FROM golang:1.22-alpine AS builder

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

# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build \
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

# Expose ports
EXPOSE 8001 8881 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD timeout 5s sh -c '</dev/tcp/localhost/8001' || exit 1

# Default command
CMD ["./vbc-pool", "config.json"] 