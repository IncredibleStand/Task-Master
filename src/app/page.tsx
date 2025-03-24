'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import AuthForm from '@/components/AuthForm';
import { Task, User } from '@/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | 'reset' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchTasks(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchTasks = async (token: string) => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks. Please try again later.';
      setError(errorMessage);
      console.error('Fetch tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (email: string, password: string, isSignup: boolean) => {
    const endpoint = isSignup ? 'signup' : 'login';
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const { token, user } = await response.json();
      localStorage.setItem('token', token);
      setUser(user);
      setShowAuth(null);
      setError('');
      setSuccessMessage('');
      fetchTasks(token);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed.';
      setError(errorMessage);
      setSuccessMessage('');
      setResetLink('');
      console.error('HandleAuth error:', err);
    }
  };

  const handleResetRequest = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process reset request');
      }

      const data = await response.json();
      setError('');
      setSuccessMessage('');
      setResetLink(data.resetLink);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process reset request.';
      setError(errorMessage);
      setSuccessMessage('');
      setResetLink('');
      console.error('Reset request error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTasks([]);
    setError('');
    setSuccessMessage('');
    setResetLink('');
  };

  const addTask = async (newTask: Omit<Task, '_id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add task');
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setError('');
      setSuccessMessage('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
      setResetLink('');
      console.error('Add task error:', err);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const taskToUpdate = tasks.find((task) => task._id === id);
      if (!taskToUpdate) return;

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !taskToUpdate.completed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
      setError('');
      setSuccessMessage('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
      setResetLink('');
      console.error('Toggle status error:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }

      setTasks(tasks.filter((task) => task._id !== id));
      setError('');
      setSuccessMessage('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
      setResetLink('');
      console.error('Delete task error:', err);
    }
  };

  const handleHomeClick = () => {
    setShowAuth(null);
    setError('');
    setSuccessMessage('');
    setResetLink('');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        <Link href="/" onClick={handleHomeClick}>
          TaskMaster
        </Link>
      </h1>

      {!user && !showAuth && (
        <div className="max-w-3xl mx-auto text-center mb-12 bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg shadow-lg">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 animate-fade-in">
            Unleash Your Productivity with TaskMaster
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Say goodbye to chaos and hello to control! TaskMaster helps you
            organize your life, crush your goals, and stay on top of every task
            with ease. Ready to master your day?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowAuth('signup')}
              className="bg-green-500 text-white py-2 px-6 rounded-full hover:bg-green-600 transition duration-300"
            >
              Get Started
            </button>
            <button
              onClick={() => setShowAuth('login')}
              className="bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition duration-300"
            >
              Log In
            </button>
          </div>
          {successMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
        </div>
      )}

      {showAuth && (
        <div className="max-w-md mx-auto">
          <AuthForm
            onAuth={handleAuth}
            onReset={handleResetRequest}
            isSignup={showAuth === 'signup'}
            isReset={showAuth === 'reset'}
            resetLink={resetLink}
          />
          <div className="mt-4 text-center">
            {showAuth === 'login' && (
              <button
                onClick={() => setShowAuth('reset')}
                className="text-blue-600 hover:underline mr-4"
              >
                Forgot Password?
              </button>
            )}
            <button
              onClick={() => setShowAuth(null)}
              className="text-blue-600 hover:underline"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Tasks</h2>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
            <AddTaskForm onAddTask={addTask} />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onToggleStatus={toggleTaskStatus}
                onDeleteTask={deleteTask}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}