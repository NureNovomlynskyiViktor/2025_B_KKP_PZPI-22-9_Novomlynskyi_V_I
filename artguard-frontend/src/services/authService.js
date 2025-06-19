import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase';

import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000/api'; 

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data; 
};

export const getMe = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const response = await axios.post(`${API_URL}/google-login`, {
      idToken,
    });

    localStorage.setItem('token', response.data.token);
    return { success: true, token: response.data.token };

  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};