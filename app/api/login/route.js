import { dbConnect } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  try {
    const mongooseConn = await dbConnect();
    const db = mongooseConn.connection.db; 

    const admin = await db.collection("admin").findOne({ email });

    if (!admin) {
      return res.status(400).json({
        success: false, 
        message: "অ্যাডমিন পাওয়া যায়নি!",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "পাসওয়ার্ড ভুল হয়েছে!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "login successfully",
    });
  } catch (error) {
    console.error("🔥 DATABASE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "login server failed",
      error: error.message,
    });
  }
}