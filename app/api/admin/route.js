// app/api/admin/route.js
import { cookies } from 'next/headers';
import { connectToDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';


export async function POST(req) {
  await connectToDB();
  const body = await req.json();
  const { email, password, action } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Email and password required' }), { status: 400 });
  }

  if (action === 'signup') {
    const exists = await Admin.findOne({ email });
    if (exists) return new Response(JSON.stringify({ message: 'Admin already exists' }), { status: 400 });

    const newAdmin = await Admin.create({ email, password });
    return new Response(JSON.stringify({ message: 'Admin created', admin: { id: newAdmin._id, email: newAdmin.email } }), { status: 201 });
  }

  if (action === 'login') {
    const admin = await Admin.findOne({ email, password });
    if (!admin) return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });

    const headers = new Headers();
    headers.append('Set-Cookie', `adminId=${admin._id}; Path=/; HttpOnly; SameSite=Lax`);

    return new Response(JSON.stringify({ message: 'Login successful', admin: { id: admin._id, email: admin.email } }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ message: 'Invalid action' }), { status: 400 });
}

export async function GET(req) {
  await connectToDB();
  const cookieStore = cookies();
  const adminId = cookieStore.get('adminId')?.value;

  if (!adminId) return new Response(JSON.stringify({ admin: null }), { status: 200 });

  const admin = await Admin.findById(adminId);
  if (!admin) return new Response(JSON.stringify({ admin: null }), { status: 200 });

  return new Response(JSON.stringify({ admin: { id: admin._id, email: admin.email } }), { status: 200 });
}
