import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../redux/actions/bookActions';
import BookCard from './BookCard';

const RecommendationList = () => {
  const dispatch = useDispatch();
  const recommendations = useSelector((state) => state.book.recommendations);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  return (
    <div className="recommendation-list">
      {recommendations.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default RecommendationList;