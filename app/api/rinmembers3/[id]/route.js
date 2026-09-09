import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Rinmember3 from "@/models/Rinmember3";
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

export async function PUT(req, { params }) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই!" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedMember = await Rinmember3.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return NextResponse.json({ success: false, error: "পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedMember }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ success: false, error: "অনুমতি নেই!" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const deletedMember = await Rinmember3.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json({ success: false, error: "পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}