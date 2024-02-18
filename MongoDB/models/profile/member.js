import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobileNumber: { type: Number, required: true, unique: true },
    email: { type: String, default: "" },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    state: { type: String, default: "" },
    pan: { type: String, default: "" },
    avatar: { type: String, default: "" },
    isMobileNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    category: { type: String, default: "" },
    fathersName: { type: String, default: "" },
    adminId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const memberModel = mongoose.model("Member", MemberSchema);

export default memberModel;
