#!/bin/bash

# Start MongoDB (if not already running)
echo "Starting MongoDB..."
mongod --dbpath ./data/db &

# Start the backend server
echo "Starting backend server..."
cd backend
npm start &

# Start the frontend development server
echo "Starting frontend server..."
cd ../frontend
npm start &

# Setup and start the ML service
echo "Setting up ML service..."
cd ../ml_service
python setup.py
echo "Starting ML service..."
python app.py &

# Start the model training script
echo "Starting model training script..."
python train_models.py &

echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "ML Service: http://localhost:8000"

# Keep the script running
wait 