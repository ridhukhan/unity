import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Member2 from "@/models/Member2";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

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

// PUT: শুধুমাত্র অ্যাডমিন আপডেট করতে পারবে
export async function PUT(req, { params }) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই! অ্যাডমিন লগইন প্রয়োজন।" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedMember = await Member2.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return NextResponse.json({ success: false, error: "মেম্বার পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedMember }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: শুধুমাত্র অ্যাডমিন ডিলিট করতে পারবে
export async function DELETE(req, { params }) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই! অ্যাডমিন লগইন প্রয়োজন।" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;

    const deletedMember = await Member2.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json({ success: false, error: "মেম্বার পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
