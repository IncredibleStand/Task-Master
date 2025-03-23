import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { TaskSchema } from '@/models/Task';
import { verifyToken } from '@/lib/auth';

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export async function GET(req: NextRequest) {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const tasks = await Task.find({ user: user.id });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const { title, description, priority } = await req.json();
  if (!title) {
    return NextResponse.json({ message: 'Title is required' }, { status: 400 });
  }

  const newTask = new Task({
    title,
    description,
    priority,
    user: user.id,
  });
  await newTask.save();
  return NextResponse.json(newTask, { status: 201 });
}