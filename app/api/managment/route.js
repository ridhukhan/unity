import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import Management from "@/models/management"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345"

export async function GET() {
  try {
    await dbConnect()
    let data = await Management.findOne()
    
    if (!data) {
      data = { founders: [], directors: [], partners: [] }
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // ১. অ্যাডমিন কুকি ভেরিফিকেশন
    const token = request.cookies.get("adminToken")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "অনুমতি নেই!" }, { status: 401 })
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ success: false, message: "টোকেন মেয়াদউত্তীর্ণ!" }, { status: 403 })
    }

    // ২. ডাটাবেজ আপডেট
    const body = await request.json()
    await dbConnect()

    const updatedData = await Management.findOneAndUpdate({}, body, {
      upsert: true,
      new: true,
    })

    return NextResponse.json({ success: true, data: updatedData })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}