import mongoose from "mongoose";

const idSchema = new mongoose.Schema({
  name: String,
  information: String,
});

const businessInformationSchema = new mongoose.Schema({
  businessName: String,
  businessAddress: String,
  gstNo: String,
  msme: String,
  shopEst: String,
});

const bankSchema = new mongoose.Schema({
  bankName: String,
  accountNumber: String,
  accountType: String,
  IFSC: String,
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
    aadhar: { type: Number, default: null },
    pan: { type: String, default: "" },
    avatar: { type: String, default: "" },
    otp: { type: Number, default: null },
    isMobileNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    category: { type: String, default: "" },
    fathersName: { type: String, default: "" },
    ids: { type: [idSchema], default: [] },
    businessInformation: { type: [businessInformationSchema], default: [] },
    otherInformation: {
      bank: { type: [bankSchema], default: [] },
      director: { type: [memberSchema], default: [] },
      shareholder: { type: [memberSchema], default: [] },
      partnerLLP: { type: [memberSchema], default: [] },
      partnerFirm: { type: [memberSchema], default: [] },
      member: { type: [memberSchema], default: [] },
    },
  },

  { timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
