import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Member from "@/models/Member";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

// অ্যাডমিন যাচাই করার হেলপার ফাংশন
function verifyAdmin(req) {
  const token = req.cookies.get("adminToken")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

// GET: যেকোনো ভিজিটর দেখতে পারবে
export async function GET() {
  try {
    await dbConnect();
    const members = await Member.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: members }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: শুধুমাত্র অ্যাডমিন নতুন মেম্বার তৈরি করতে পারবে
export async function POST(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই! অ্যাডমিন লগইন প্রয়োজন।" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const newMember = await Member.create(body);
    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
