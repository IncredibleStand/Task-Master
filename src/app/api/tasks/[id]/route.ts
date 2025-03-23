import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { TaskSchema } from '@/models/Task';
import { verifyToken } from '@/lib/auth';

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const { id } = await context.params; // Await params
  const updatedTask = await Task.findOneAndUpdate(
    { _id: id, user: user.id },
    await req.json(),
    { new: true, runValidators: true }
  );
  if (!updatedTask) return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  return NextResponse.json(updatedTask);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = verifyToken(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const { id } = await context.params; // Await params
  const deletedTask = await Task.findOneAndDelete({ _id: id, user: user.id });
  if (!deletedTask) return NextResponse.json({ message: 'Task not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 }); // Correct 204 response
}