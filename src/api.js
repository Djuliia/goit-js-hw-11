import axios from 'axios';

export async function serviceGallery(searchQuery, page = 1) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '38325444-19d5d000bdb868a15072d8439';
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });
  const response = await axios.get(`${BASE_URL}?${searchParams}`);
  return await response.data;
}
