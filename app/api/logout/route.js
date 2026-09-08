import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  // adminToken কুকিটি ডিলিট/এক্সপায়ার করে দেওয়া
  response.cookies.set("adminToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}