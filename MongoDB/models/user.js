import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobileNumber: { type: Number, required: true, default: "" },
    email: { type: String, default: "" },
    dob: { type: String, default: "" },
    aadhar: { type: Number },
    pan: { type: String, default: "" },
    avatar: { type: String, default: "" },
    otp: { type: Number, default: "" },
    isMobileNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
