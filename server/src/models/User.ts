import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      index: true,
    },
    firstName: String,
    lastName: String,
    imageUrl: String,
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
