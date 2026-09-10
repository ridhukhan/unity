import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "ইমেইল এবং OTP আবশ্যক!" },
        { status: 400 }
      );
    }

    const mongooseConn = await dbConnect();
    const db = mongooseConn.connection.db;

    // ১. ডাটাবেজ থেকে OTP তথ্য খোঁজা
    const otpRecord = await db.collection("otps").findOne({ email });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP পাওয়া যায়নি! আবার চেষ্টা করুন।" },
        { status: 400 }
      );
    }

    // ২. মেয়াদ চেক করা
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await db.collection("otps").deleteOne({ email });
      return NextResponse.json(
        { success: false, message: "OTP-এর মেয়াদ শেষ হয়ে গেছে!" },
        { status: 400 }
      );
    }

    // ৩. OTP মিলানো
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "ভুল OTP প্রদান করেছেন!" },
        { status: 400 }
      );
    }

    // ৪. সিকিউর Reset Token তৈরি করা
    const resetToken = crypto.randomBytes(32).toString("hex");

    await db.collection("otps").updateOne(
      { email },
      { $set: { verified: true, resetToken } }
    );

    return NextResponse.json({
      success: true,
      resetToken,
      message: "OTP ভেরিফিকেশন সফল হয়েছে!",
    });
  } catch (err) {
    console.error("🔥 ENTER OTP ERROR:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভারে সমস্যা হয়েছে!" },
      { status: 500 }
    );
  }
}