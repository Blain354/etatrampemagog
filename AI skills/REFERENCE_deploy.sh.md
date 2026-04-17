#!/bin/bash

# Stop immediately if a command fails
set -e

PROJECT_NAME=$1
REPO_URL=$2
DOMAIN_NAME="blain-projects.ca"

if [ -z "$PROJECT_NAME" ] || [ -z "$REPO_URL" ]; then
  echo "Error: missing parameters."
  echo "Usage: ./deploy.sh <project_name> <github_url>"
  exit 1
fi
BASE_DIR="$HOME/web_projects"
cd "$BASE_DIR"

if [ -d "$PROJECT_NAME" ]; then
  echo "Project exists. Updating via git pull..."
  cd "$PROJECT_NAME"
  git pull
else
  echo "New project. Cloning..."
  git clone "$REPO_URL" "$PROJECT_NAME"
  cd "$PROJECT_NAME"
fi

# Verify/create shared Traefik network
if ! docker network inspect web_network >/dev/null 2>&1; then
  echo "Creating 'web_network' for Traefik..."
  docker network create web_network >/dev/null
fi

echo "Configuring environment..."

# If .env.example exists and .env does not, copy it
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
  cp .env.example .env
  echo ".env created from .env.example"
fi

# Update PROJECT_NAME and DOMAIN_NAME in .env
if [ -f ".env" ]; then
  # Update or add PROJECT_NAME
  if grep -q "^PROJECT_NAME=" .env; then
    sed -i "s|^PROJECT_NAME=.*|PROJECT_NAME=$PROJECT_NAME|" .env
  else
    echo "PROJECT_NAME=$PROJECT_NAME" >> .env
  fi
  
  # Update or add DOMAIN_NAME
  if grep -q "^DOMAIN_NAME=" .env; then
    sed -i "s|^DOMAIN_NAME=.*|DOMAIN_NAME=$DOMAIN_NAME|" .env
  else
    echo "DOMAIN_NAME=$DOMAIN_NAME" >> .env
  fi
else
  # Create .env from scratch
  echo "PROJECT_NAME=$PROJECT_NAME" > .env
  echo "DOMAIN_NAME=$DOMAIN_NAME" >> .env
fi

echo "Starting containers with Docker Compose..."
docker compose up -d --build

echo "Success. Project is available at https://$PROJECT_NAME.$DOMAIN_NAME"
echo "Note: for projects with specific requirements (SSH, health checks, etc.),"
echo "      check whether they include a dedicated deployment script in scripts/deploy.sh"
