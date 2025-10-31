#!/bin/bash
# GDGoC Certificate Generator - Docker Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "GDGoC Certificate Generator Deployment"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose V2 is not available${NC}"
    exit 1
fi

# Check if .env exists (root directory)
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env not found in root directory${NC}"
    echo "Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please edit .env with your configuration (especially PostgreSQL password)${NC}"
        echo "Press Enter to continue after editing, or Ctrl+C to cancel..."
        read
    else
        echo -e "${RED}Error: .env.example not found${NC}"
        exit 1
    fi
fi

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env not found${NC}"
    echo "Creating from backend/.env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}Please edit backend/.env with your configuration before continuing${NC}"
        echo "Press Enter to continue after editing, or Ctrl+C to cancel..."
        read
    else
        echo -e "${RED}Error: backend/.env.example not found${NC}"
        exit 1
    fi
fi

# Parse command line arguments
COMMAND=${1:-up}

case $COMMAND in
    up|start)
        echo "Starting services..."
        docker compose up -d
        echo ""
        echo -e "${GREEN}✓ Services started successfully${NC}"
        echo ""
        echo "Checking service health..."
        sleep 5
        docker compose ps
        ;;
    
    down|stop)
        echo "Stopping services..."
        docker compose down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    
    restart)
        echo "Restarting services..."
        docker compose restart
        echo -e "${GREEN}✓ Services restarted${NC}"
        ;;
    
    build)
        echo "Building services..."
        docker compose build
        echo -e "${GREEN}✓ Build completed${NC}"
        ;;
    
    rebuild)
        echo "Rebuilding and restarting services..."
        docker compose up -d --build
        echo -e "${GREEN}✓ Services rebuilt and restarted${NC}"
        ;;
    
    logs)
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            docker compose logs -f
        else
            docker compose logs -f $SERVICE
        fi
        ;;
    
    ps|status)
        docker compose ps
        ;;
    
    clean)
        echo -e "${YELLOW}Warning: This will remove all containers, volumes, and data${NC}"
        echo "Press Enter to continue, or Ctrl+C to cancel..."
        read
        docker compose down -v
        echo -e "${GREEN}✓ Cleaned up${NC}"
        ;;
    
    backup)
        BACKUP_DIR="./backups"
        mkdir -p $BACKUP_DIR
        DATE=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/db_$DATE.sql"
        
        echo "Checking database health..."
        if ! docker compose ps db | grep -q "Up"; then
            echo -e "${RED}Error: Database service is not running${NC}"
            exit 1
        fi
        
        echo "Creating database backup..."
        docker compose exec -T db pg_dump -U postgres gdgoc_certs > "$BACKUP_FILE"
        echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
        ;;
    
    restore)
        if [ -z "$2" ]; then
            echo -e "${RED}Error: Please specify backup file${NC}"
            echo "Usage: $0 restore <backup-file.sql>"
            exit 1
        fi
        
        BACKUP_FILE=$2
        if [ ! -f "$BACKUP_FILE" ]; then
            echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Warning: This will overwrite current database${NC}"
        echo "Press Enter to continue, or Ctrl+C to cancel..."
        read
        
        echo "Restoring database from $BACKUP_FILE..."
        docker compose exec -T db psql -U postgres -d gdgoc_certs < "$BACKUP_FILE"
        echo -e "${GREEN}✓ Database restored${NC}"
        ;;
    
    shell)
        SERVICE=${2:-backend}
        echo "Opening shell in $SERVICE container..."
        docker compose exec $SERVICE sh
        ;;
    
    db)
        echo "Opening PostgreSQL shell..."
        docker compose exec db psql -U postgres -d gdgoc_certs
        ;;
    
    help|*)
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  up, start          Start all services"
        echo "  down, stop         Stop all services"
        echo "  restart            Restart all services"
        echo "  build              Build all services"
        echo "  rebuild            Rebuild and restart all services"
        echo "  logs [service]     View logs (all or specific service)"
        echo "  ps, status         Show service status"
        echo "  clean              Remove all containers and volumes (CAUTION)"
        echo "  backup             Create database backup"
        echo "  restore <file>     Restore database from backup"
        echo "  shell [service]    Open shell in service container (default: backend)"
        echo "  db                 Open PostgreSQL shell"
        echo "  help               Show this help message"
        echo ""
        ;;
esac
