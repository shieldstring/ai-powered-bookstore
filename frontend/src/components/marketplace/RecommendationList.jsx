import React, { useEffect } from 'react';
import BookCard from './BookCard';
import { getRecommendations } from '../../services/api';

const RecommendationList = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const data = await getRecommendations(userId);
      setRecommendations(data);
    };
    fetchRecommendations();
  }, [userId]);

  return (
    <div className="recommendation-list">
      {recommendations.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default RecommendationList;