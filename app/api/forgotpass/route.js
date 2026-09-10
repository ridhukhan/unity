import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "ইমেইল প্রদান করুন!" },
        { status: 400 }
      );
    }

    const mongooseConn = await dbConnect();
    const db = mongooseConn.connection.db;

    // ১. চেক করা ইউজার/অ্যাডমিন ডাটাবেজে আছে কিনা
    const admin = await db.collection("admin").findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি!" },
        { status: 404 }
      );
    }

    // ২. ৪ ডিজিটের OTP জেনারেট করা
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // ৫ মিনিট পর এক্সপায়ার হবে

    // ৩. 'otps' কালেকশনে OTP সেভ/আপডেট করা
    await db.collection("otps").updateOne(
      { email },
      { $set: { email, otp: generatedOtp, expiresAt, verified: false } },
      { upsert: true }
    );

    // ৪. ইমেইল পাঠানো
    await transporter.sendMail({
      from: `"Admin System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #333; background-color: #0f172a; color: #fff; border-radius: 10px;">
          <h2 style="color: #f59e0b;">Password Reset Request</h2>
          <p>Your OTP verification code is:</p>
          <h1 style="color: #06b6d4; letter-spacing: 4px; font-size: 32px;">${generatedOtp}</h1>
          <p style="color: #94a3b8;">This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP আপনার ইমেইলে পাঠানো হয়েছে!",
    });
  } catch (err) {
    console.error("🔥 FORGOT PASS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভারে সমস্যা হয়েছে!" },
      { status: 500 }
    );
  }
}