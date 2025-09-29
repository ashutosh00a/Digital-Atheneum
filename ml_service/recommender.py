import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
import joblib
import os

class BookRecommender:
    def __init__(self):
        self.content_model = None
        self.collaborative_model = None
        self.tfidf_matrix = None
        self.book_features = None
        self.user_book_matrix = None
        self.books_df = None
        self.interactions_df = None

    def prepare_content_data(self, books_data):
        """Prepare data for content-based filtering"""
        self.books_df = pd.DataFrame(books_data)
        
        # Combine relevant features for content-based filtering
        self.books_df['combined_features'] = self.books_df.apply(
            lambda x: f"{x['title']} {x['author']} {' '.join(x.get('subjects', []))} {x.get('description', '')}",
            axis=1
        )
        
        # Create TF-IDF matrix
        tfidf = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = tfidf.fit_transform(self.books_df['combined_features'])
        
        # Calculate similarity matrix
        self.content_model = cosine_similarity(self.tfidf_matrix)

    def prepare_collaborative_data(self, interactions_data):
        """Prepare data for collaborative filtering"""
        self.interactions_df = pd.DataFrame(interactions_data)
        
        # Create user-book interaction matrix
        self.user_book_matrix = self.interactions_df.pivot(
            index='user',
            columns='bookId',
            values='rating'
        ).fillna(0)
        
        # Convert to sparse matrix
        user_book_sparse = csr_matrix(self.user_book_matrix.values)
        
        # Train KNN model
        self.collaborative_model = NearestNeighbors(
            metric='cosine',
            algorithm='brute',
            n_neighbors=20
        )
        self.collaborative_model.fit(user_book_sparse)

    def get_content_recommendations(self, book_id, n_recommendations=5):
        """Get content-based recommendations for a book"""
        if self.content_model is None:
            return []
        
        # Find the index of the book
        book_idx = self.books_df[self.books_df['id'] == book_id].index[0]
        
        # Get similarity scores
        similarity_scores = list(enumerate(self.content_model[book_idx]))
        similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
        similarity_scores = similarity_scores[1:n_recommendations+1]
        
        # Get book indices
        book_indices = [i[0] for i in similarity_scores]
        
        # Return recommended books
        return self.books_df.iloc[book_indices][['id', 'title', 'author', 'coverUrl']].to_dict('records')

    def get_collaborative_recommendations(self, user_id, n_recommendations=5):
        """Get collaborative filtering recommendations for a user"""
        if self.collaborative_model is None:
            return []
        
        # Get user's row in the interaction matrix
        user_idx = self.user_book_matrix.index.get_loc(user_id)
        user_interactions = self.user_book_matrix.iloc[user_idx].values.reshape(1, -1)
        
        # Find similar users
        distances, indices = self.collaborative_model.kneighbors(user_interactions)
        
        # Get books that similar users liked
        similar_users = self.user_book_matrix.iloc[indices[0]]
        user_books = set(self.user_book_matrix.columns[self.user_book_matrix.iloc[user_idx] > 0])
        
        # Get recommendations
        recommendations = []
        for book in similar_users.columns:
            if book not in user_books:
                score = similar_users[book].mean()
                recommendations.append((book, score))
        
        # Sort and get top N recommendations
        recommendations.sort(key=lambda x: x[1], reverse=True)
        top_recommendations = recommendations[:n_recommendations]
        
        # Get book details
        recommended_books = []
        for book_id, _ in top_recommendations:
            book_details = self.books_df[self.books_df['id'] == book_id]
            if not book_details.empty:
                recommended_books.append(book_details[['id', 'title', 'author', 'coverUrl']].iloc[0].to_dict())
        
        return recommended_books

    def get_hybrid_recommendations(self, user_id, book_id=None, n_recommendations=5):
        """Get hybrid recommendations combining content-based and collaborative filtering"""
        content_recs = []
        if book_id:
            content_recs = self.get_content_recommendations(book_id, n_recommendations)
        
        collab_recs = self.get_collaborative_recommendations(user_id, n_recommendations)
        
        # Combine and deduplicate recommendations
        all_recs = content_recs + collab_recs
        seen = set()
        unique_recs = []
        
        for rec in all_recs:
            if rec['id'] not in seen:
                seen.add(rec['id'])
                unique_recs.append(rec)
        
        return unique_recs[:n_recommendations]

    def save_models(self, path='models'):
        """Save trained models"""
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.content_model, f'{path}/content_model.joblib')
        joblib.dump(self.collaborative_model, f'{path}/collaborative_model.joblib')
        joblib.dump(self.tfidf_matrix, f'{path}/tfidf_matrix.joblib')
        self.books_df.to_pickle(f'{path}/books_df.pkl')
        self.interactions_df.to_pickle(f'{path}/interactions_df.pkl')

    def load_models(self, path='models'):
        """Load trained models"""
        self.content_model = joblib.load(f'{path}/content_model.joblib')
        self.collaborative_model = joblib.load(f'{path}/collaborative_model.joblib')
        self.tfidf_matrix = joblib.load(f'{path}/tfidf_matrix.joblib')
        self.books_df = pd.read_pickle(f'{path}/books_df.pkl')
        self.interactions_df = pd.read_pickle(f'{path}/interactions_df.pkl') 