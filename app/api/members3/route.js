import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Member3 from "@/models/Member3";
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

export async function GET() {
  try {
    await dbConnect();
    const members = await Member3.find({}).sort({ order: 1 });
    return NextResponse.json({ success: true, data: members }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: শুধুমাত্র অ্যাডমিন নতুন মেম্বার তৈরি করতে পারবে
export async function POST(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই! অ্যাডমিন লগইন প্রয়োজন।" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();

    const count = await Member3.countDocuments();
    const newMemberData = { ...body, order: count };

    const newMember = await Member3.create(newMemberData);
    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT: ড্র্যাগ অ্যান্ড ড্রপের পর নতুন অর্ডার আপডেট করা
export async function PUT(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই! অ্যাডমিন লগইন প্রয়োজন।" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const reorderedMembers = body.reorderedMembers || body;

    if (!Array.isArray(reorderedMembers)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 });
    }

    const bulkOps = reorderedMembers.map((member, index) => ({
      updateOne: {
        filter: { _id: member._id },
        update: { $set: { order: index } },
      },
    }));

    await Member3.bulkWrite(bulkOps);

    return NextResponse.json({ success: true, message: "Order updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}