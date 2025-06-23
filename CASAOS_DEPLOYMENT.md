# GameTrack CasaOS Deployment Guide

This guide will help you deploy the GameTrack application on your CasaOS server using Docker containers.

## ??? Architecture Overview

The deployment consists of three main components:
- **Frontend**: React application served by Nginx
- **Backend**: PocketBase database and API server
- **Proxy** (Optional): Nginx reverse proxy for production

## ?? Prerequisites

### On Your CasaOS Server (192.168.1.219)
- Docker and Docker Compose installed
- Ports 3000 and 8090 available
- SSH access enabled
- At least 1GB free disk space

### On Your Development Machine
- Git installed
- SSH client

## ?? Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Transfer files to your CasaOS server:**
   ```bash
   # From your development machine
   scp -r . user@192.168.1.219:/home/user/gametrack/
   ```

2. **SSH into your CasaOS server:**
   ```bash
   ssh user@192.168.1.219
   cd /home/user/gametrack/
   ```

3. **Make the deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

4. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

### Method 2: Manual Deployment

1. **SSH into your CasaOS server:**
   ```bash
   ssh user@192.168.1.219
   ```

2. **Clone or transfer the project:**
   ```bash
   git clone <your-repo-url> gametrack
   cd gametrack
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update the following values:
   ```env
   VITE_POCKETBASE_URL=http://192.168.1.219:8090
   POCKETBASE_ADMIN_EMAIL=your-admin@email.com
   POCKETBASE_ADMIN_PASSWORD=your-secure-password
   ```

4. **Build and start services:**
   ```bash
   docker-compose up -d --build
   ```

5. **Setup PocketBase database:**
   ```bash
   # Wait for services to start (about 30 seconds)
   sleep 30
   
   # Run the setup script
   node setup-pocketbase.js
   ```

## ?? Configuration

### Port Configuration
- **Frontend**: Port 3000 (http://192.168.1.219:3000)
- **PocketBase**: Port 8090 (http://192.168.1.219:8090)
- **Production Proxy**: Port 80 (optional)

### Environment Variables
Key environment variables in `.env`:
```env
# PocketBase URL for the frontend
VITE_POCKETBASE_URL=http://192.168.1.219:8090

# PocketBase admin credentials
POCKETBASE_ADMIN_EMAIL=admin@gametrack.local
POCKETBASE_ADMIN_PASSWORD=changeme123
```

## ?? Docker Services

### Frontend Service
- **Image**: Custom built from Dockerfile
- **Port**: 3000:80
- **Purpose**: Serves the React application

### PocketBase Service
- **Image**: ghcr.io/muchobien/pocketbase:latest
- **Port**: 8090:8090
- **Volume**: Persistent data storage
- **Purpose**: Database and API backend

### Nginx Proxy (Production)
- **Image**: nginx:alpine
- **Port**: 80:80
- **Purpose**: Routes traffic between frontend and backend

## ?? Accessing Your Application

After successful deployment:

1. **GameTrack Application**: http://192.168.1.219:3000
2. **PocketBase Admin**: http://192.168.1.219:8090/_/
3. **PocketBase API**: http://192.168.1.219:8090/api/

## ?? Initial Setup

1. **Access PocketBase Admin Panel**:
   - Go to http://192.168.1.219:8090/_/
   - Create admin account or use configured credentials

2. **Configure Database**:
   - The setup script should have created the necessary collections
   - Verify the `user_games` collection exists
   - Check access rules are properly configured

3. **Test the Application**:
   - Go to http://192.168.1.219:3000
   - Create a user account
   - Add some games to test functionality

## ??? Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f gametrack-frontend
docker-compose logs -f pocketbase
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart gametrack-frontend
```

### Stop Services
```bash
docker-compose down
```

### Update Application
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Data
```bash
# Backup PocketBase data
docker-compose exec pocketbase tar -czf /tmp/backup.tar.gz /pb_data
docker cp gametrack-pocketbase:/tmp/backup.tar.gz ./pocketbase-backup-$(date +%Y%m%d).tar.gz
```

## ?? Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :8090
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **PocketBase Not Starting**:
   ```bash
   # Check logs
   docker-compose logs pocketbase
   
   # Ensure data directory permissions
   sudo chown -R 1000:1000 ./pocketbase_data
   ```

3. **Frontend Can't Connect to Backend**:
   - Verify `VITE_POCKETBASE_URL` in `.env`
   - Check if PocketBase is accessible: `curl http://192.168.1.219:8090/api/health`
   - Ensure firewall allows the ports

4. **Build Failures**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

### Health Checks

```bash
# Check service status
docker-compose ps

# Test PocketBase API
curl http://192.168.1.219:8090/api/health

# Test frontend
curl http://192.168.1.219:3000
```

## ?? Security Considerations

1. **Change Default Passwords**: Update PocketBase admin credentials
2. **Firewall**: Configure firewall to restrict access if needed
3. **HTTPS**: Consider setting up SSL/TLS for production
4. **Backup**: Regular backups of PocketBase data
5. **Updates**: Keep Docker images updated

## ?? Production Deployment

For production use, enable the reverse proxy:

```bash
# Start with production profile
docker-compose --profile production up -d
```

This will:
- Route all traffic through port 80
- Provide better performance
- Enable proper API routing

## ?? Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify network connectivity
3. Ensure all required ports are available
4. Check CasaOS system resources

## ?? Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [CasaOS Documentation](https://wiki.casaos.io/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)