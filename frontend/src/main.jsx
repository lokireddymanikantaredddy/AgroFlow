import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.PROD 
  ? 'https://agroflow.netlify.app' 
  : 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false; // Changed from true to false since we're using token-based auth

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 