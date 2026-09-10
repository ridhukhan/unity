import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, resetToken, password } = await req.json();

    if (!email || !resetToken || !password) {
      return NextResponse.json(
        { success: false, message: "সকল তথ্য সঠিকভাবে দিন!" },
        { status: 400 }
      );
    }

    const mongooseConn = await dbConnect();
    const db = mongooseConn.connection.db;

    // ১. ডাটাবেজে রিসেট টোকেন ও ইমেইল যাচাই করা
    const otpRecord = await db.collection("otps").findOne({ email, resetToken });

    if (!otpRecord || !otpRecord.verified) {
      return NextResponse.json(
        { success: false, message: "অনুমতি নেই! নতুন করে চেষ্টা করুন।" },
        { status: 403 }
      );
    }

    // ২. নতুন পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    // ৩. 'admin' কালেকশনে পাসওয়ার্ড আপডেট করা
    const updateResult = await db.collection("admin").updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "পাসওয়ার্ড আপডেট করা সম্ভব হয়নি!" },
        { status: 400 }
      );
    }

    // ৪. কাজ শেষ হলে otps কালেকশন থেকে ডাটা মুছে ফেলা
    await db.collection("otps").deleteOne({ email });

    return NextResponse.json({
      success: true,
      message: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!",
    });
  } catch (err) {
    console.error("🔥 RESET PASS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভারে সমস্যা হয়েছে!" },
      { status: 500 }
    );
  }
}