import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:3001', // Your backend URL
    withCredentials: true, // This is crucial for sending session cookies
});

export default api;