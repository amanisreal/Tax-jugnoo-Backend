import mongoose from "mongoose";

const idSchema = new mongoose.Schema({
  name: String,
  information: String,
});
const registrationSchema = new mongoose.Schema({
  name: String,
  information: String,
});

const businessInformationSchema = new mongoose.Schema({
  businessName: String,
  businessAddress: String,
  registrations: { type: [registrationSchema], default: [] },
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

const InformationSchema = new mongoose.Schema(
  {
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
    userId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const userModel = mongoose.model("Information", InformationSchema);

export default userModel;
