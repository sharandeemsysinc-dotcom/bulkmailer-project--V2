import axios from 'axios';

const api = axios.create({
  baseURL: 'http://14.195.114.174:5018/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
