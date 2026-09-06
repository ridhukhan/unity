import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Member from "@/models/Member";

export async function GET() {
  try {
    await dbConnect();
    const members = await Member.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: members }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const newMember = await Member.create(body);
    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}