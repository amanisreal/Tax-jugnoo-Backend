import mongoose from "mongoose";

const membersSchema = new mongoose.Schema({
  name: String,
  memberId: String,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobileNumber: { type: Number, required: true, unique: true },
    email: { type: String, default: "" },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    state: { type: String, default: "" },
    pan: { type: String, default: "" },
    avatar: { type: String, default: "" },
    otp: { type: Number, default: null },
    isMobileNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    category: { type: String, default: "" },
    fathersName: { type: String, default: "" },
    members: { type: [membersSchema], default: [] },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
