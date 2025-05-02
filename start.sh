#!/bin/bash

# Backend setup
echo "Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Start backend server in the background
echo "Starting Flask server in development mode..."
cd ../backend
sudo python app.py &  # Run backend in the background

# Start frontend server in the background
echo "Starting React frontend server..."
cd ../frontend
npm run dev &
