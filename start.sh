#!/bin/bash

# Start the backend in the background
echo "Starting FastAPI backend..."
cd backend
source ../venv/Scripts/activate
python main.py &
BACKEND_PID=$!

# Start the frontend
echo "Starting React frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
