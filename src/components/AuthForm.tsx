'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  onAuth: (email: string, password: string, isSignup: boolean) => void;
  onReset: (email: string) => void;
  isSignup: boolean;
  isReset: boolean;
  resetLink?: string;
}

export default function AuthForm({ onAuth, onReset, isSignup, isReset, resetLink }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReset) {
      onReset(email);
    } else {
      onAuth(email, password, isSignup);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isReset ? 'Reset Password' : isSignup ? 'Sign Up' : 'Log In'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        {!isReset && (
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          {isReset ? 'Request Reset Link' : isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      {resetLink && isReset && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center">
          <p className="mb-2">Password reset link generated!</p>
          <Link href={resetLink}>
            <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
              Reset Password
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}