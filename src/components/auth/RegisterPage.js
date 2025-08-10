import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockData } from '../../data/mockData';

const RegisterPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (username && email && password) {
      const newUser = { id: `user${mockData.users.length + 1}`, name: username };
      mockData.users.push(newUser);
      login(newUser);
      onNavigate('dashboard');
    } else {
      setError('Please fill out all fields.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>
        <form onSubmit={handleRegister} className="space-y-6">
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
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
