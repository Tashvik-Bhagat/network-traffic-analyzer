#!/bin/bash

# Stop frontend (React/Vite)
echo "Stopping frontend server..."
# Sending SIGINT (Ctrl + C) to the frontend process
pkill -SIGINT -f 'node' || echo "Frontend not running"

# Stop backend (Flask)
echo "Stopping backend server..."
# Sending SIGINT (Ctrl + C) to the backend process
pkill -SIGINT -f 'python' || echo "Backend not running"
