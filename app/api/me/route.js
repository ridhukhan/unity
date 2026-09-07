import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

export async function GET(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;

    if (!token) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ isAdmin: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}