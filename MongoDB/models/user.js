import mongoose from "mongoose";

const idSchema = new mongoose.Schema({
  name: String,
  information: { type: String, unique: true },
});

const businessInformationSchema = new mongoose.Schema({
  businessName: String,
  businessAddress: String,
  gstNo: String,
  msme: String,
  shopEst: String,
});

const memberSchema = new mongoose.Schema({
  photo: String,
  firstName: String,
  lastName: String,
  fathersName: String,
  mobile: String,
  email: String,
  PAN: String,
  aadhar: String,
  passportNo: String,
  DIN: String,
  directorType: String,
  dateOfJoining: String,
  dateOfRetirement: String,
  noOfShare: String,
  faceValueOfShare: String,
  DPIN: String,
  IsDesignatedPartner: String,
  profitOrLossShare: String,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobileNumber: { type: Number, required: true, unique: true },
    email: { type: String, default: "" },
    dob: { type: String, default: "" },
    aadhar: { type: Number },
    pan: { type: String, default: "" },
    avatar: { type: String, default: "" },
    otp: { type: Number, default: "" },
    isMobileNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    category: String,
    fathersName: String,
    ids: [idSchema],
    businessInformation: [businessInformationSchema],
    otherInformation: {
      bankName: String,
      accountNumber: String,
      accountType: String,
      IFSC: String,
      director: [memberSchema],
      shareholder: [memberSchema],
      partnerLLP: [memberSchema],
      partnerFirm: [memberSchema],
      member: [memberSchema],
    },
  },

  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
