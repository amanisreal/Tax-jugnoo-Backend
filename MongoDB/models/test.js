const mongoose = require("mongoose");

const directorSchema = new mongoose.Schema({
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

const idSchema = new mongoose.Schema({
  name: String,
  information: String,
});

const basicInformationSchema = new mongoose.Schema({
  profileImage: String,
  category: String,
  contact: String,
  email: String,
  PAN: String,
  DOB: String,
  state: String,
  address: String,
  fathersName: String,
  ids: [idSchema],
});

const businessInformationSchema = new mongoose.Schema({
  businessName: String,
  businessAddress: String,
  gstNo: String,
  msme: String,
  shopEst: String,
});

const shareholderSchema = new mongoose.Schema({
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

const fullSchema = new mongoose.Schema({
  basicInformation: basicInformationSchema,
  businessInformation: [businessInformationSchema],
  otherInformation: {
    bankName: String,
    accountNumber: String,
    accountType: String,
    IFSC: String,
    director: [directorSchema],
    shareholder: [shareholderSchema],
    partnerLLP: [directorSchema],
    partnerFirm: [directorSchema],
    member: [directorSchema],
  },
});

const FullModel = mongoose.model("FullModel", fullSchema);

module.exports = FullModel;
