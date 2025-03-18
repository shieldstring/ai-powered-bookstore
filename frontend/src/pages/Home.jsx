// frontend/src/pages/Home.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '../app/bookSlice';
import BookList from '../components/marketplace/BookList';

const Home = () => {
  const dispatch = useDispatch();
  const { books, status, error } = useSelector((state) => state.books);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBooks());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome to the AI-Powered Bookstore</h1>
      <BookList books={books} />
    </div>
  );
};

export default Home;