import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: " " },
    mobile: { type: Number, required: true, default: " " },
    email: { type: String, required: true, default: " " },
    dob: { type: String, required: true, default: " " },
    aadhar: { type: Number, required: true },
    pan: { type: String, required: true, default: " " },
    avatar: { type: String, required: true, default: " " },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
