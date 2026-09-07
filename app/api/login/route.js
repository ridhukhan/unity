import { dbConnect } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন!" },
        { status: 400 }
      );
    }

    const mongooseConn = await dbConnect();
    const db = mongooseConn.connection.db;

    // 'admin' কানেকশনে ইমেইল দিয়ে ডাটা খোঁজা
    const admin = await db.collection("admin").findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "অ্যাডমিন পাওয়া যায়নি!" },
        { status: 400 }
      );
    }

    // পাসওয়ার্ড হ্যাশ ভেরিফাই করা
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "পাসওয়ার্ড ভুল হয়েছে!" },
        { status: 401 }
      );
    }

    // JWT Token তৈরি করা
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Response তৈরি করা
    const response = NextResponse.json({
      success: true,
      message: "লগইন সফল হয়েছে!",
    });

    // HTTP-Only Cookie-তে JWT Token সেট করা
    response.cookies.set({
      name: "adminToken",
      value: token, // আসল সাইন করা JWT Token
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // ৭ দিন
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("🔥 DATABASE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "লগইন ব্যর্থ হয়েছে!", error: error.message },
      { status: 500 }
    );
  }
}