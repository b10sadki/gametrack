#!/bin/bash

# GameTrack Docker Deployment Script for CasaOS
# This script helps deploy the GameTrack application on your CasaOS server

set -e

echo "?? GameTrack Docker Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="192.168.1.219"
FRONTEND_PORT="3000"
POCKETBASE_PORT="8090"
PROXY_PORT="80"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# PocketBase Configuration
VITE_POCKETBASE_URL=http://${SERVER_IP}:${POCKETBASE_PORT}

# Admin Configuration (Change these!)
POCKETBASE_ADMIN_EMAIL=admin@gametrack.local
POCKETBASE_ADMIN_PASSWORD=changeme123

# Server Configuration
SERVER_IP=${SERVER_IP}
FRONTEND_PORT=${FRONTEND_PORT}
POCKETBASE_PORT=${POCKETBASE_PORT}
PROXY_PORT=${PROXY_PORT}
EOF
        print_success "Environment file created. Please review and update .env file with your settings."
    else
        print_warning "Environment file already exists. Skipping creation."
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Services started successfully!"
}

# Setup PocketBase
setup_pocketbase() {
    print_status "Setting up PocketBase database..."
    
    # Wait for PocketBase to be ready
    print_status "Waiting for PocketBase to start..."
    sleep 10
    
    # Check if PocketBase is running
    if curl -f http://${SERVER_IP}:${POCKETBASE_PORT}/api/health &>/dev/null; then
        print_success "PocketBase is running!"
        
        # Run the setup script if it exists
        if [ -f "setup-pocketbase.js" ]; then
            print_status "Running PocketBase setup script..."
            node setup-pocketbase.js
        fi
    else
        print_warning "PocketBase might not be ready yet. You can run the setup manually later."
    fi
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo "?? Deployment Complete!"
    echo "======================"
    echo ""
    echo "Your GameTrack application is now running:"
    echo ""
    echo "?? Frontend Application: http://${SERVER_IP}:${FRONTEND_PORT}"
    echo "???  PocketBase Admin:     http://${SERVER_IP}:${POCKETBASE_PORT}/_/"
    echo "?? PocketBase API:       http://${SERVER_IP}:${POCKETBASE_PORT}/api/"
    echo ""
    echo "?? Next Steps:"
    echo "1. Access PocketBase Admin to configure your database"
    echo "2. Update admin credentials (current: admin@gametrack.local / changeme123)"
    echo "3. Run database setup: node setup-pocketbase.js"
    echo "4. Access your GameTrack application"
    echo ""
    echo "?? Management Commands:"
    echo "• View logs:    docker-compose logs -f"
    echo "• Stop:         docker-compose down"
    echo "• Restart:      docker-compose restart"
    echo "• Update:       docker-compose pull && docker-compose up -d"
    echo ""
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_docker
    create_env_file
    deploy_services
    setup_pocketbase
    show_deployment_info
    
    print_success "Deployment completed successfully!"
}

# Run main function
main "$@"