// src/services/authService.js
export const login = async (email, password) => {
    const response = await fetch('/api/login', { // Adjust URL as needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  };
  
  export const register = async (email, password) => {
    const response = await fetch('/api/register', { // Adjust URL as needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    return response.json();
  };
  