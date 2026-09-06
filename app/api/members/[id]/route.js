import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Member from "@/models/Member";

// Update Member (PUT)
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedMember = await Member.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: "মেম্বার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedMember }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Delete Member (DELETE)
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedMember = await Member.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json(
        { success: false, error: "মেম্বার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}