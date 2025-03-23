import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserSchema } from '@/models/User';

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: NextRequest) {
  await mongoose.connect(process.env.MONGODB_URI!);

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  return NextResponse.json({ token, user: { id: user._id, email: user.email } }, { status: 201 });
}