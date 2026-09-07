import mongoose from "mongoose"

const ManagementSchema = new mongoose.Schema(
  {
    founders: [
      {
        id: Number,
        name: String,
        image: String,
      },
    ],
    directors: [
      {
        id: Number,
        name: String,
        image: String,
      },
    ],
    partners: [
      {
        id: Number,
        name: String,
        image: String,
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.models.Management || mongoose.model("Management", ManagementSchema)