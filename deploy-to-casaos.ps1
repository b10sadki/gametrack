# GameTrack CasaOS Deployment Script for Windows
# This PowerShell script helps deploy GameTrack to your CasaOS server

param(
    [string]$ServerIP = "192.168.1.219",
    [string]$Username = "casaos",
    [string]$DeployPath = "/home/casaos/gametrack"
)

Write-Host "?? GameTrack CasaOS Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if required tools are available
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Check for SCP (usually comes with Git for Windows)
if (-not (Test-Command "scp")) {
    Write-Host "? SCP not found. Please install Git for Windows or OpenSSH." -ForegroundColor Red
    Write-Host "   Download Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "? SCP found" -ForegroundColor Green

# Create deployment package
Write-Host "?? Creating deployment package..." -ForegroundColor Blue

# Files to include in deployment
$FilesToDeploy = @(
    "src",
    "public",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    "Dockerfile",
    "docker-compose.yml",
    "nginx.conf",
    "proxy.conf",
    ".dockerignore",
    ".env.example",
    "deploy.sh",
    "setup-pocketbase.js",
    "CASAOS_DEPLOYMENT.md",
    "POCKETBASE_MIGRATION.md",
    "README.md"
)

# Create temporary directory for deployment
$TempDir = "$env:TEMP\gametrack-deploy"
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy files to temp directory
foreach ($File in $FilesToDeploy) {
    if (Test-Path $File) {
        if (Test-Path $File -PathType Container) {
            Copy-Item $File -Destination $TempDir -Recurse
        } else {
            Copy-Item $File -Destination $TempDir
        }
        Write-Host "  ? $File" -ForegroundColor Green
    } else {
        Write-Host "  ? $File (not found, skipping)" -ForegroundColor Yellow
    }
}

Write-Host "?? Transferring files to CasaOS server..." -ForegroundColor Blue
Write-Host "   Server: $Username@$ServerIP" -ForegroundColor Gray
Write-Host "   Path: $DeployPath" -ForegroundColor Gray
Write-Host ""

# Transfer files using SCP
try {
    # Create remote directory
    ssh "$Username@$ServerIP" "mkdir -p $DeployPath"
    
    # Transfer files
    scp -r "$TempDir\*" "$Username@$ServerIP:$DeployPath/"
    
    Write-Host "? Files transferred successfully!" -ForegroundColor Green
} catch {
    Write-Host "? Failed to transfer files: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up temp directory
Remove-Item $TempDir -Recurse -Force

Write-Host ""
Write-Host "?? Deployment package transferred!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. SSH into your CasaOS server:" -ForegroundColor White
Write-Host "   ssh $Username@$ServerIP" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Navigate to the project directory:" -ForegroundColor White
Write-Host "   cd $DeployPath" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Make the deployment script executable:" -ForegroundColor White
Write-Host "   chmod +x deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run the deployment:" -ForegroundColor White
Write-Host "   ./deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Access your application:" -ForegroundColor White
Write-Host "   Frontend: http://$ServerIP:3000" -ForegroundColor Gray
Write-Host "   PocketBase Admin: http://$ServerIP:8090/_/" -ForegroundColor Gray
Write-Host ""
Write-Host "?? For detailed instructions, see CASAOS_DEPLOYMENT.md" -ForegroundColor Blue