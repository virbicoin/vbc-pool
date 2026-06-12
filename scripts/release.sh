#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
VERSION=""
SKIP_TESTS=false
SKIP_BUILD=false
DOCKER_BUILD=false

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

show_help() {
    cat << EOF
Usage: $0 [OPTIONS] VERSION

Create a release of VBC Pool

OPTIONS:
    -h, --help          Show this help message
    -s, --skip-tests    Skip running tests
    -b, --skip-build    Skip building binaries
    -d, --docker        Build Docker image as well
    
EXAMPLES:
    $0 v1.0.0                    # Create release v1.0.0
    $0 --skip-tests v1.0.1       # Create release without running tests
    $0 --docker v1.1.0           # Create release with Docker image

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -b|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -d|--docker)
            DOCKER_BUILD=true
            shift
            ;;
        -*)
            log_error "Unknown option $1"
            ;;
        *)
            if [[ -z "$VERSION" ]]; then
                VERSION="$1"
            else
                log_error "Multiple versions specified"
            fi
            shift
            ;;
    esac
done

# Validate version
if [[ -z "$VERSION" ]]; then
    log_error "Version is required"
fi

if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
    log_error "Version must follow semver format (e.g., v1.0.0)"
fi

log_info "Starting release process for version: $VERSION"

# Change to project directory
cd "$PROJECT_DIR"

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
    log_warning "Working directory is not clean. Uncommitted changes detected."
    read -p "Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Release aborted"
    fi
fi

# Check if tag already exists
if git tag -l | grep -q "^$VERSION$"; then
    log_error "Tag $VERSION already exists"
fi

# Run tests
if [[ "$SKIP_TESTS" == false ]]; then
    log_info "Running tests..."
    if ! make test; then
        log_error "Tests failed"
    fi
    log_success "Tests passed"
fi

# Build binaries
if [[ "$SKIP_BUILD" == false ]]; then
    log_info "Building release binaries..."
    if ! make release; then
        log_error "Build failed"
    fi
    log_success "Binaries built successfully"
    
    # Show built files
    log_info "Built files:"
    ls -la releases/
fi

# Build Docker image
if [[ "$DOCKER_BUILD" == true ]]; then
    log_info "Building Docker image..."
    if ! make docker; then
        log_error "Docker build failed"
    fi
    log_success "Docker image built successfully"
fi

# Create git tag
log_info "Creating git tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION"
log_success "Git tag created"

# Show next steps
log_success "Release $VERSION prepared successfully!"
echo
log_info "Next steps:"
echo "  1. Push the tag: git push origin $VERSION"
echo "  2. GitHub Actions will automatically create the release"
echo "  3. Upload additional assets if needed"
if [[ "$DOCKER_BUILD" == true ]]; then
    echo "  4. Push Docker image: docker push virbicoin/pool:$VERSION"
fi

# Ask if user wants to push the tag
echo
read -p "Push the tag now? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Pushing tag to origin..."
    git push origin "$VERSION"
    log_success "Tag pushed! GitHub Actions should start building the release."
    echo
    echo "Monitor the build at: https://github.com/virbicoin/vbc-pool/actions"
fi 