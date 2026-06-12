# Virbicoin Pool - Release Build Configuration
.PHONY: all build clean release test docker

# Version info
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "v1.0.0")
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME := $(shell date -u '+%Y-%m-%d_%H:%M:%S')

# Go build settings
GO := go
GOOS := $(shell go env GOOS)
GOARCH := $(shell go env GOARCH)
CGO_ENABLED := 1

# Binary name
BINARY_NAME := vbc-pool
PACKAGE := github.com/virbicoin/vbc-pool

# Build flags
LDFLAGS := -ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)"

# Output directory
DIST_DIR := dist
RELEASE_DIR := releases

# Supported platforms
PLATFORMS := \
	linux/amd64 \
	linux/arm64 \
	linux/386 \
	windows/amd64 \
	windows/386 \
	darwin/amd64 \
	darwin/arm64 \
	freebsd/amd64

# Default target
all: build

# Build for current platform
build:
	@echo "Building $(BINARY_NAME) v$(VERSION) for $(GOOS)/$(GOARCH)..."
	@mkdir -p $(DIST_DIR)
	CGO_ENABLED=$(CGO_ENABLED) $(GO) build $(LDFLAGS) -o $(DIST_DIR)/$(BINARY_NAME) .

# Multi-platform release target (Linux only due to CGO requirements for ethash)
release: clean
	@echo "Building Linux multi-arch release..."
	@mkdir -p $(RELEASE_DIR)
	
	# Linux AMD64
	@echo "Building for linux/amd64..."
	CGO_ENABLED=1 GOOS=linux GOARCH=amd64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-linux-amd64 .
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-$(VERSION)-linux-amd64.tar.gz $(BINARY_NAME)-$(VERSION)-linux-amd64
	
	# Linux ARM64
	@echo "Building for linux/arm64..."
	CC=aarch64-linux-gnu-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-linux-arm64 .
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-$(VERSION)-linux-arm64.tar.gz $(BINARY_NAME)-$(VERSION)-linux-arm64
	
	# Windows AMD64
	@echo "Building for windows/amd64..."
	CGO_ENABLED=1 GOOS=windows GOARCH=amd64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-windows-amd64.exe .
	@cd $(RELEASE_DIR) && zip $(BINARY_NAME)-$(VERSION)-windows-amd64.zip $(BINARY_NAME)-$(VERSION)-windows-amd64.exe
	
	# macOS AMD64
	@echo "Building for darwin/amd64..."
	CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-darwin-amd64 .
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-$(VERSION)-darwin-amd64.tar.gz $(BINARY_NAME)-$(VERSION)-darwin-amd64
	
	# macOS ARM64 (Apple Silicon)
	@echo "Building for darwin/arm64..."
	CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-darwin-arm64 .
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-$(VERSION)-darwin-arm64.tar.gz $(BINARY_NAME)-$(VERSION)-darwin-arm64
	
	@echo "Multi-platform release built in $(RELEASE_DIR)/"
	@ls -la $(RELEASE_DIR)/

# Build with optimizations for production
release-optimized: clean
	@echo "Building optimized release..."
	@mkdir -p $(RELEASE_DIR)
	CGO_ENABLED=1 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-$(GOOS)-$(GOARCH) .
	@cd $(RELEASE_DIR) && \
		tar -czf $(BINARY_NAME)-$(VERSION)-$(GOOS)-$(GOARCH).tar.gz \
		$(BINARY_NAME)-$(VERSION)-$(GOOS)-$(GOARCH)
	@echo "Optimized release built: $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-$(GOOS)-$(GOARCH).tar.gz"

# ARM64 specific build
build-arm64:
	@echo "Building $(BINARY_NAME) $(VERSION) for linux/arm64..."
	@mkdir -p $(DIST_DIR)
	CC=aarch64-linux-gnu-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm64 $(GO) build $(LDFLAGS) -o $(DIST_DIR)/$(BINARY_NAME)-arm64 .

# ARM64 release build
release-arm64: clean
	@echo "Building ARM64 release..."
	@mkdir -p $(RELEASE_DIR)
	CC=aarch64-linux-gnu-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-linux-arm64 .
	@cd $(RELEASE_DIR) && \
		tar -czf $(BINARY_NAME)-$(VERSION)-linux-arm64.tar.gz \
		$(BINARY_NAME)-$(VERSION)-linux-arm64
	@echo "ARM64 release built: $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-linux-arm64.tar.gz"

# Linux-only release (AMD64 and ARM64)
release-linux: clean
	@echo "Building Linux release for AMD64 and ARM64..."
	@mkdir -p $(RELEASE_DIR)
	
	# Linux AMD64
	@echo "Building for linux/amd64..."
	CGO_ENABLED=1 GOOS=linux GOARCH=amd64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-linux-amd64 .
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-$(VERSION)-linux-amd64.tar.gz $(BINARY_NAME)-$(VERSION)-linux-amd64
	
	# Linux ARM64
	@echo "Building for linux/arm64..."
	CC=aarch64-linux-gnu-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm64 $(GO) build \
		-ldflags "-s -w -X main.Version=$(VERSION) -X main.Commit=$(COMMIT) -X main.BuildTime=$(BUILD_TIME)" \
		-trimpath \
		-o $(RELEASE_DIR)/$(BINARY_NAME)-$(VERSION)-linux-arm64 .
	@cd $(RELEASE_DIR) && tar -czf $(BINARY_NAME)-$(VERSION)-linux-arm64.tar.gz $(BINARY_NAME)-$(VERSION)-linux-arm64
	
	@echo "Linux release built in $(RELEASE_DIR)/"
	@ls -la $(RELEASE_DIR)/

# Run tests
test:
	@echo "Running tests..."
	@if ! nc -z localhost 6379 2>/dev/null; then \
		echo "Warning: Redis not running on localhost:6379"; \
		echo "Some tests may fail. Start Redis with: redis-server redis-test.conf"; \
	fi
	$(GO) test -v ./...

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(DIST_DIR) $(RELEASE_DIR)

# Build Docker image
docker:
	@echo "Building Docker image..."
	docker build -t virbicoin/pool:$(VERSION) .
	docker tag virbicoin/pool:$(VERSION) virbicoin/pool:latest

# Install dependencies
deps:
	@echo "Installing dependencies..."
	$(GO) mod download
	$(GO) mod verify

# Format code
fmt:
	@echo "Formatting code..."
	$(GO) fmt ./...

# Lint code
lint:
	@echo "Running golangci-lint..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run --out-format=colored-line-number; \
	else \
		echo "golangci-lint not found. Installing..."; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		golangci-lint run --out-format=colored-line-number; \
	fi

# Show version
version:
	@echo "Version: $(VERSION)"
	@echo "Commit: $(COMMIT)"
	@echo "Build Time: $(BUILD_TIME)"

# Install binary to system
install: build
	@echo "Installing $(BINARY_NAME) to /usr/local/bin..."
	sudo cp $(DIST_DIR)/$(BINARY_NAME) /usr/local/bin/
	sudo chmod +x /usr/local/bin/$(BINARY_NAME)

# Show help
help:
	@echo "Available targets:"
	@echo "  build              - Build binary for current platform"
	@echo "  build-arm64        - Build binary for Linux ARM64"
	@echo "  release            - Build optimized binaries for all platforms"
	@echo "  release-linux      - Build optimized binaries for Linux (AMD64 and ARM64)"
	@echo "  release-arm64      - Build optimized binary for Linux ARM64"
	@echo "  release-optimized  - Build optimized binary for current platform"
	@echo "  test               - Run tests (requires Redis on localhost:6379)"
	@echo "  test-all           - Run lint checks and tests"
	@echo "  test-with-redis    - Start Redis, run tests, stop Redis"
	@echo "  test-with-redis-lint - Run lint checks, start Redis, run tests, stop Redis"
	@echo "  redis-start        - Start Redis server for testing"
	@echo "  redis-stop         - Stop Redis server"
	@echo "  clean              - Clean build artifacts"
	@echo "  docker             - Build Docker image"
	@echo "  deps               - Download dependencies"
	@echo "  fmt                - Format code"
	@echo "  lint               - Run linter (golangci-lint)"
	@echo "  install            - Install binary to system"
	@echo "  version            - Show version information"
	@echo "  help               - Show this help"

# Start Redis for testing
redis-start:
	@echo "Starting Redis for testing..."
	@if command -v redis-server >/dev/null 2>&1; then \
		redis-server redis-test.conf --daemonize yes; \
		echo "Redis started on port 6379"; \
	else \
		echo "Redis not installed. Install with: sudo apt-get install redis-server"; \
	fi

# Stop Redis
redis-stop:
	@echo "Stopping Redis..."
	@pkill redis-server 2>/dev/null || echo "Redis was not running"

# Test with Redis
test-with-redis: redis-start test redis-stop 

# Run tests with lint check
test-all: lint test

# Test with Redis and lint
test-with-redis-lint: lint test-with-redis 