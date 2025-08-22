import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student'); // 👈 NEW
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter a username.');
      return;
    }

    // 🔥 Frontend-only demo: directly create a user object, optionally call backend later
    const user = {
      id: `u_${username.toLowerCase().replace(/\s+/g, '')}`,
      name: username,
      role, // 'student' | 'teacher'
    };

    try {
      // if you still want server: uncomment
      // const response = await fetch('http://localhost:3001/api/login', { ... })
      // const serverUser = await response.json();
      login(user);
      onNavigate('dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed.');
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

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Login as</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                />
                Student
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={role === 'teacher'}
                  onChange={() => setRole('teacher')}
                />
                Teacher
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>

          <p className="text-sm text-gray-600 text-center">
            New here?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-indigo-600 hover:underline"
            >
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
