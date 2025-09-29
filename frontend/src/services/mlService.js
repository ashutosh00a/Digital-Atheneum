import axios from 'axios';

const ML_API_URL = 'http://localhost:8000';

export const getRecommendations = async (userId, bookId = null) => {
  try {
    const response = await axios.post(`${ML_API_URL}/recommendations`, {
      user_id: userId,
      book_id: bookId
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const trainContentModel = async (books) => {
  try {
    const response = await axios.post(`${ML_API_URL}/train/content`, {
      books: books.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description || '',
        subjects: book.subjects || [],
        genres: book.genres || []
      }))
    });
    return response.data;
  } catch (error) {
    console.error('Error training content model:', error);
    throw error;
  }
};

export const trainCollaborativeModel = async (interactions) => {
  try {
    const response = await axios.post(`${ML_API_URL}/train/collaborative`, {
      interactions: interactions.map(interaction => ({
        user_id: interaction.userId,
        book_id: interaction.bookId,
        interaction_type: interaction.interactionType,
        rating: interaction.rating || 0
      }))
    });
    return response.data;
  } catch (error) {
    console.error('Error training collaborative model:', error);
    throw error;
  }
}; 