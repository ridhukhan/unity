import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb1"
 // আপনার mongo dbConnect ফাইলের পাথ
import Management from "@/models/Management"

export async function GET() {
  try {
    await connectDB()
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
    const body = await request.json()
    await connectDB()

    const updatedData = await Management.findOneAndUpdate({}, body, {
      upsert: true,
      new: true,
    })

    return NextResponse.json({ success: true, data: updatedData })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}