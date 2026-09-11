import mongoose from "mongoose";

const rintransactionSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  joma: { // আদায়ের পরিমাণ
    type: Number,
    default: 0,
  },
  comments: {
    type: String,
    default: "",
  },
});

const rinmemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    biboron: {
      type: String,
      required: true,
    },
    ashol: {
      type: Number,
      default: 0,
    },
    lab: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      required: true,
    },
    serial: {
      type: Number,
      default: 0,
    },
    transactions: [rintransactionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Rinmember ||
  mongoose.model("Rinmember", rinmemberSchema);