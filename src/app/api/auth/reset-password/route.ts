import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { UserSchema } from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const User = mongoose.models.User || mongoose.model('User', UserSchema);

let mongooseConnection: Promise<typeof mongoose> | null = null;

async function connectToDatabase() {
  if (mongooseConnection && mongoose.connection.readyState === 1) {
    console.log('Reusing existing MongoDB connection');
    return mongooseConnection;
  }

  console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);
  mongooseConnection = mongoose.connect(process.env.MONGODB_URI!, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await mongooseConnection;
  console.log('MongoDB connected');
  return mongooseConnection;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ message: 'Failed to reset password', error: error.message }, { status: 500 });
  }
}