from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from recommender import BookRecommender
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.book_recommender

# Initialize recommender
recommender = BookRecommender()

class BookData(BaseModel):
    id: str
    title: str
    author: str
    subjects: Optional[List[str]] = []
    description: Optional[str] = ""

class InteractionData(BaseModel):
    user: str
    bookId: str
    rating: float

class RecommendationRequest(BaseModel):
    user_id: str
    book_id: Optional[str] = None
    n_recommendations: int = 5

@app.post("/train/content")
async def train_content_model():
    try:
        # Fetch books from MongoDB
        books = await db.books.find().to_list(length=None)
        books_data = [{
            'id': str(book['_id']),
            'title': book['title'],
            'author': book['author'],
            'subjects': book.get('subjects', []),
            'description': book.get('description', '')
        } for book in books]
        
        recommender.prepare_content_data(books_data)
        recommender.save_models()
        return {"message": "Content model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train/collaborative")
async def train_collaborative_model():
    try:
        # Fetch interactions from MongoDB
        interactions = await db.interactions.find().to_list(length=None)
        interactions_data = [{
            'user': str(interaction['user_id']),
            'bookId': str(interaction['book_id']),
            'rating': interaction['rating']
        } for interaction in interactions]
        
        recommender.prepare_collaborative_data(interactions_data)
        recommender.save_models()
        return {"message": "Collaborative model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = recommender.get_hybrid_recommendations(
            request.user_id,
            request.book_id,
            request.n_recommendations
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 