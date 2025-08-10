import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockData } from '../../data/mockData';

const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      const user = mockData.users.find(u => u.name.toLowerCase() === username.toLowerCase());
      if (user) {
        login(user);
        onNavigate('dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } else {
      setError('Please enter a username and password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
