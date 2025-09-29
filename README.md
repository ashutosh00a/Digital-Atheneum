# E-Library Book Recommender System

A full-stack web application for an e-library with an intelligent book recommendation system. The application allows users to browse, read, and get personalized book recommendations based on their reading history and preferences.

## Features

- 📚 Book browsing and searching
- 🔍 Advanced search functionality
- 📖 Online book reader
- 🤖 AI-powered book recommendations
- 👤 User authentication and profiles
- 📱 Responsive design
- 🌙 Dark/Light theme support
- 📝 Book reviews and ratings
- 🔖 Reading progress tracking
- 💬 Social features (comments, discussions)
- 📊 Reading analytics

## Tech Stack

### Frontend
- React.js
- Redux for state management
- React Router for navigation
- Bootstrap for styling
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB for database
- JWT for authentication
- CORS enabled

### ML Service
- Python-based recommendation engine
- Collaborative filtering
- Content-based filtering
- Hybrid recommendation system

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- MongoDB (or MongoDB Atlas account)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-library
```

2. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Configure MongoDB connection string and other required variables

3. Using Docker (Recommended):
```bash
# Build and start all services
docker-compose up --build

# To run in detached mode
docker-compose up -d
```

4. Manual Setup (Alternative):
```bash
# Install backend dependencies
cd backend
npm install
npm start

# Install frontend dependencies
cd frontend
npm install
npm start

# Install ML service dependencies
cd ml_service
pip install -r requirements.txt
python app.py
```

## Environment Variables

### Backend (.env)
```
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
```