import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Note from "@/models/note";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

// অ্যাডমিন চেক করার হেলপার ফাংশন
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

// GET: যে কেউ নোট পড়তে পারবে
export async function GET() {
  try {
    await dbConnect();
    const note = await Note.findOne({});
    return NextResponse.json({ text: note ? note.text : "" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

// POST: শুধুমাত্র অ্যাডমিন নোট সেভ বা আপডেট করতে পারবে
export async function POST(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "অনুমতি নেই! অ্যাডমিন লগইন প্রয়োজন।" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { text } = await req.json();

    const existingNote = await Note.findOne({});
    if (existingNote) {
      existingNote.text = text;
      await existingNote.save();
    } else {
      await Note.create({ text });
    }

    return NextResponse.json({ message: "Note saved successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}