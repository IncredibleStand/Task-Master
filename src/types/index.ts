export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  user: string;
  createdAt?: string;
}

export interface User {
  _id: string;
  email: string;
}