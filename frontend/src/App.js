import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboard from './pages/AdminDashboard';
import BookFormPage from './pages/BookFormPage';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider, default as ThemeContext } from './utils/ThemeContext';
import { AuthProvider } from './utils/AuthContext';
import { FavoritesProvider } from './utils/FavoritesContext';
import { ReadingHistoryProvider } from './utils/ReadingHistoryContext';
import { SearchProvider } from './utils/SearchContext';
import { NotificationProvider } from './utils/NotificationContext';
import { SocialProvider } from './utils/SocialContext';
import BookmarkContext, { BookmarkProvider } from './utils/BookmarkContext';
import BookReaderPage from './pages/BookReaderPage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
import ChatPage from './pages/ChatPage';
import BookmarkPanel from './components/BookmarkPanel';
import FloatingChatButton from './components/FloatingChatButton';
import ChatPanel from './components/ChatPanel';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { useSelector } from 'react-redux';
import UserPreferencesPage from './pages/UserPreferencesPage';
import BookSearch from './components/BookSearch';

const AppContent = () => {
  const { theme } = useContext(ThemeContext);
  const { showPanel, closeBookmarkPanel, currentBookId, currentPageNum } = useContext(BookmarkContext);
  const [showChatPanel, setShowChatPanel] = useState(false);
  
  return (
    <>
      <Header />
      <main className={`py-3 ${theme === 'dark' ? 'main-dark' : 'main-light'}`}>
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<BookSearch />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book/:id" element={<BookDetailsPage />} />
            <Route path="/book/:id/read" element={<BookReaderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/reading-history" element={<ReadingHistoryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route path="/admin/book/create" element={<BookFormPage />} />
            <Route path="/admin/book/:id/edit" element={<BookFormPage />} />
            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <UserPreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
      
      {/* Global BookmarkPanel */}
      <BookmarkPanel 
        show={showPanel} 
        onHide={closeBookmarkPanel} 
        bookId={currentBookId || "global"} 
        currentPage={currentPageNum} 
      />
      
      {/* Chat Panel - Side panel for chat */}
      <ChatPanel 
        show={showChatPanel} 
        onHide={() => setShowChatPanel(false)} 
      />
      
      {/* Global Floating Chat Button */}
      {!showChatPanel && (
        <FloatingChatButton onClick={() => setShowChatPanel(true)} />
      )}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SearchProvider>
            <SocialProvider>
              <BookmarkProvider>
                <FavoritesProvider>
                  <ReadingHistoryProvider>
                    <AppContent />
                  </ReadingHistoryProvider>
                </FavoritesProvider>
              </BookmarkProvider>
            </SocialProvider>
          </SearchProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Protected Routes
const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);
  return userInfo ? children : <Navigate to="/login" />;
};

// Admin Routes
const AdminRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);
  return userInfo?.role === 'admin' ? children : <Navigate to="/" />;
};

export default App; 