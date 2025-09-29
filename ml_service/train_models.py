import os
import time
import schedule
import requests
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_training.log'),
        logging.StreamHandler()
    ]
)

# API endpoints
BACKEND_URL = 'http://localhost:5000/api'
ML_SERVICE_URL = 'http://localhost:8000'

def fetch_books():
    """Fetch all books from the backend."""
    try:
        response = requests.get(f'{BACKEND_URL}/books')
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logging.error(f"Error fetching books: {str(e)}")
        return []

def fetch_interactions():
    """Fetch recent user interactions from the backend."""
    try:
        # Get interactions from the last 7 days
        start_date = (datetime.now() - timedelta(days=7)).isoformat()
        response = requests.get(f'{BACKEND_URL}/interactions', params={'startDate': start_date})
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logging.error(f"Error fetching interactions: {str(e)}")
        return []

def train_content_model(books):
    """Train the content-based model."""
    try:
        response = requests.post(f'{ML_SERVICE_URL}/train/content', json={'books': books})
        response.raise_for_status()
        logging.info("Content model training completed successfully")
    except Exception as e:
        logging.error(f"Error training content model: {str(e)}")

def train_collaborative_model(interactions):
    """Train the collaborative filtering model."""
    try:
        response = requests.post(f'{ML_SERVICE_URL}/train/collaborative', json={'interactions': interactions})
        response.raise_for_status()
        logging.info("Collaborative model training completed successfully")
    except Exception as e:
        logging.error(f"Error training collaborative model: {str(e)}")

def train_models():
    """Main function to train both models."""
    logging.info("Starting model training...")
    
    # Fetch data
    books = fetch_books()
    interactions = fetch_interactions()
    
    if not books:
        logging.warning("No books found for training")
        return
    
    # Train content model
    train_content_model(books)
    
    if interactions:
        # Train collaborative model
        train_collaborative_model(interactions)
    else:
        logging.warning("No recent interactions found for collaborative training")

def main():
    """Main function to schedule and run model training."""
    # Train models immediately on startup
    train_models()
    
    # Schedule daily training at 2 AM
    schedule.every().day.at("02:00").do(train_models)
    
    logging.info("Model training scheduler started")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main() 