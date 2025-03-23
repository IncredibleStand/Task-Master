import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { UserSchema } from '@/models/User';
import jwt from 'jsonwebtoken';

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: NextRequest) {
  try {
    console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected');

    const { email } = await req.json();
    if (!email) {
      console.log('Email missing in request');
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('Generating reset token with JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    const host = req.headers.get('host');
    if (!host) {
      console.error('Host header missing in request');
      return NextResponse.json({ message: 'Internal server error: Host header missing' }, { status: 500 });
    }
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const resetLink = `${protocol}://${host}/reset-password?token=${resetToken}`;
    console.log('Dynamic base URL:', `${protocol}://${host}`);
    console.log('Reset link:', resetLink);

    // Skip email sending for now
    return NextResponse.json(
      { message: 'Password reset link generated. Email sending is disabled until SMTP is activated.', resetLink },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating reset link:', error);
    return NextResponse.json({ message: 'Failed to generate reset link', error: error.message }, { status: 500 });
  } finally {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
  }
}