import axios from 'axios';

//Aponta para o backend facilitando caso mude a URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

export default api;