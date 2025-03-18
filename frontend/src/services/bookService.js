import api from './api';

export const getBooks = () => api.get('/books');
export const getBookDetails = (id) => api.get(`/books/${id}`);
export const purchaseBook = (id) => api.post(`/books/${id}/purchase`);