#!/bin/bash

# LVUP EDU Development Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 LVUP EDU Development Environment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18 or higher. Current version: $(node --version)"
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker is not installed. Some features may not work."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_warning "Docker Compose is not installed. Some features may not work."
    fi
    
    log_success "Prerequisites check completed"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."
    
    if [ ! -f ".env.local" ]; then
        log_info "Creating .env.local from template..."
        cp .env.example .env.local
        log_warning "Please edit .env.local with your actual configuration values"
    else
        log_info ".env.local already exists"
    fi
    
    # Create environment files for apps
    if [ ! -f "apps/web/.env.local" ]; then
        log_info "Creating web app environment file..."
        cat > apps/web/.env.local << EOF
# Web app specific environment variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
EOF
    fi
    
    if [ ! -f "apps/api/.env" ]; then
        log_info "Creating API environment file..."
        cat > apps/api/.env << EOF
# API specific environment variables
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/lvup_edu
REDIS_URL=redis://localhost:6379
EOF
    fi
    
    log_success "Environment files setup completed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    pnpm install
    
    log_success "Dependencies installed"
}

# Setup Git hooks
setup_git_hooks() {
    log_info "Setting up Git hooks..."
    
    # Install husky
    pnpm exec husky install
    
    # Make hooks executable
    chmod +x .husky/pre-commit
    chmod +x .husky/commit-msg
    
    log_success "Git hooks setup completed"
}

# Initialize database
init_database() {
    log_info "Initializing database..."
    
    # Check if PostgreSQL is running
    if ! nc -z localhost 5432; then
        log_warning "PostgreSQL is not running. Starting with Docker..."
        
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d postgres redis
        elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
            docker compose up -d postgres redis
        else
            log_error "Docker Compose is not available. Please start PostgreSQL manually."
        fi
        
        # Wait for PostgreSQL to be ready
        log_info "Waiting for PostgreSQL to be ready..."
        sleep 10
    fi
    
    # Run database migrations
    log_info "Running database migrations..."
    pnpm run db:migrate
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    pnpm run db:generate
    
    # Seed database
    log_info "Seeding database..."
    pnpm run db:seed
    
    log_success "Database initialization completed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p coverage
    mkdir -p test-results
    mkdir -p apps/web/public/uploads
    mkdir -p apps/api/uploads
    mkdir -p docker/nginx/conf.d
    mkdir -p docker/nginx/ssl
    mkdir -p docker/postgres/init
    mkdir -p docker/redis
    mkdir -p tests/e2e/storage
    
    log_success "Directories created"
}

# Setup VS Code settings
setup_vscode() {
    log_info "Setting up VS Code configuration..."
    
    mkdir -p .vscode
    
    # Create settings.json
    cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.workingDirectories": ["apps/web", "apps/api"],
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/coverage": true,
    "**/logs": true
  }
}
EOF
    
    # Create launch.json for debugging
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/web/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "runtimeArgs": ["--inspect"],
      "env": {
        "NODE_OPTIONS": "--inspect"  
      }
    },
    {
      "name": "Debug NestJS API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/dist/main.js",
      "cwd": "${workspaceFolder}/apps/api",
      "runtimeArgs": ["--inspect"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
EOF
    
    # Create extensions.json
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-playwright.playwright",
    "ms-vscode.vscode-json"
  ]
}
EOF
    
    log_success "VS Code configuration completed"
}

# Run initial tests
run_tests() {
    log_info "Running initial tests..."
    
    # Type check
    log_info "Running type check..."
    pnpm run type-check
    
    # Linting
    log_info "Running linter..."
    pnpm run lint
    
    # Unit tests
    log_info "Running unit tests..."
    pnpm run test:unit || log_warning "Some tests failed (this is normal for initial setup)"
    
    log_success "Initial tests completed"
}

# Display final instructions
show_final_instructions() {
    echo ""
    echo "🎉 Development environment setup completed!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your actual configuration values"
    echo "2. Start the development servers:"
    echo "   - Full stack: docker-compose up"
    echo "   - Or manually:"
    echo "     • API: cd apps/api && pnpm dev"
    echo "     • Web: cd apps/web && pnpm dev"
    echo ""
    echo "Available commands:"
    echo "• pnpm dev          - Start all development servers"
    echo "• pnpm build        - Build all applications" 
    echo "• pnpm test         - Run all tests"
    echo "• pnpm lint         - Run linting"
    echo "• pnpm format       - Format code"
    echo ""
    echo "Docker services:"
    echo "• docker-compose up              - Start all services"
    echo "• docker-compose up postgres     - Start only database"
    echo "• docker-compose logs -f         - View logs"
    echo ""
    echo "Access URLs:"
    echo "• Web App:    http://localhost:3000"
    echo "• API:        http://localhost:8000"
    echo "• DB Admin:   http://localhost:8080 (if using pgAdmin)"
    echo ""
    log_success "Ready to start developing! 🚀"
}

# Main execution
main() {
    check_prerequisites
    create_directories
    setup_environment
    install_dependencies
    setup_git_hooks
    setup_vscode
    init_database
    run_tests
    show_final_instructions
}

# Run main function
main "$@"