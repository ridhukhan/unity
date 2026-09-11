import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Rinmember from "@/models/Rinmember";
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
    // serial অনুযায়ী ascending সাজানো হবে
    const members = await Rinmember.find({}).sort({ serial: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: members }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই!" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();

    // নতুন সদস্যের জন্য সর্বোচ্চ serial নম্বর নির্ধারণ
    const count = await Rinmember.countDocuments();
    const newMember = await Rinmember.create({
      ...body,
      serial: count + 1,
    });

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Reorder / Drag and Drop Update Endpoint
export async function PUT(req) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই!" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { items } = await req.json(); // Array of { _id, serial }

    if (Array.isArray(items)) {
      const bulkOps = items.map((item, index) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { serial: index + 1 },
        },
      }));
      await Rinmember.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}