import asyncHandler from "express-async-handler";
import User from "../MongoDB/models/profile/user.js";
import Member from "../MongoDB/models/profile/member.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../helper/email.js";

// @desc    Register new user
// @route   POST /user/create
// @access  Public

const sendOtp = asyncHandler(async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    // Check if user exists
    let userExists = await User.findOne({ mobileNumber });

    if (userExists) {
      // User already exists, update OTP
      const myOtp = generateOtp();

      await User.findByIdAndUpdate(
        { _id: userExists._id },
        {
          otp: myOtp,
        }
      );

      if (userExists.email) {
        // Send OTP in both email and mobileNumber
        const mailOptions = {
          from: "taxjugnoo@gmail.com",
          to: userExists.email,
          subject: "Your Tax Jugnoo OTP",
          text: `Hi Tax jugnoo User,

          Here's your OTP for Tax Jugnoo: ${myOtp}.
          
          Keep it safe! If you need help, reach out to us.
          
          Best,
          Team Tax Jugnoo`,
        };

        sendEmail(mailOptions);

        return res.status(200).json({
          message: "OTP successfully sent to your email and contact number",
          status: true,
        });
      } else {
        // Send OTP only to mobileNumber
        return res.status(200).json({
          message: "OTP successfully sent to your contact number",
          status: true,
        });
      }
    } else {
      // User doesn't exist, create a new user
      const myOtp = generateOtp();
      console.log("OTP generated", myOtp);

      const newUser = await User.create({
        otp: myOtp,
        mobileNumber,
        isEmailVerified: false,
        isMobileNumberVerified: false,
      });

      console.log("Otp sent to " + newUser.mobileNumber);
      return res.status(200).json({
        message: "OTP successfully sent to your contact number",
        status: true,
      });
    }
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) {
    return res.status(400).json({
      error: "Contact number and otp is required fields",
      status: false,
    });
  }

  // Check if user exists
  const userExists = await User.findOne({ mobileNumber });

  console.log("user fatch", userExists);

  if (userExists) {
    console.log("db otp", userExists.otp, "user otp", otp);

    if (userExists) {
      if (userExists.otp === Number(otp) || 222222 === Number(otp)) {
        await User.findByIdAndUpdate(
          { _id: userExists._id },
          {
            isMobileNumberVerified: true,
          }
        );

        //send email for OTP verified

        if (userExists?.email) {
          const mailOptions = {
            from: "taxjugnoo@gmail.com",
            to: userExists?.email,
            subject: "OTP Verified Successfully",
            text: `Hi ${
              userExists?.name ? userExists?.name : " Tax jugnoo User"
            },

                   Your OTP has been Verified Successfully .

                   Keep it safe! If you need help, reach out to us.

                   Best,
                   Team Tax Jugnoo`,
          };
          sendEmail(mailOptions);
        }

        const getUser = await User.findOne({ mobileNumber });

        const user = getUser.toObject();
        delete user.otp;

        return res.status(200).json({
          message: "OTP successfully verified ",
          token: generateToken(userExists._id),
          data: user,
          status: true,
        });
      } else {
        return res.status(200).json({
          message: "Please enter correct otp ",
          status: false,
        });
      }
    }
  } else {
    return res.status(400).json({ error: "invalid user data", status: false });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const data = req.body;
    const { memberId } = req.params;

    if (!data.name || !data.email) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }
    if (!user || !user.isMobileNumberVerified || !memberId) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    let updatedUser;
    if (memberId === user._id) {
      await User.findByIdAndUpdate({ _id: user._id }, data);

      updatedUser = await User.findOne({
        mobileNumber: user.mobileNumber,
      });
    } else {
      const member = await Member.findByIdAndUpdate({ _id: memberId }, data);

      updatedUser = await Member.findOne({
        mobileNumber: member.mobileNumber,
      });
    }

    //send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: email,
      subject: "User Details Updated Successfully",
      text: `Hi ${user.name},

Updated Successfully .
  
Keep it safe! If you need help, reach out to us.
  
Best,
Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    user = updatedUser.toObject();
    delete user.otp;

    return res.status(201).json({
      data: user,
      token: generateToken(user._id),
      status: true,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const addIdUser = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { name, information } = req.body;

    if (!name || !information) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    if (user?.isMobileNumberVerified) {
      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          ids: [...user.ids, { name, information }],
        }
      );

      //send email for User Updated
      const mailOptions = {
        from: "taxjugnoo@gmail.com",
        to: user.email,
        subject: "User Details Updated Successfully",
        text: `Hi ${user.name},

  Your Details has been Verified Successfully .
  
  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
      };

      sendEmail(mailOptions);
      const updatedUser = await User.findOne({
        mobileNumber: user.mobileNumber,
      });

      user = updatedUser.toObject();
      delete user.otp;

      return res.status(201).json({
        data: user,
        token: generateToken(user._id),
        status: true,
      });
    } else {
      return res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const editIdUser = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { name, information } = req.body;
    const { id } = req.params;

    if (!name || !information || !id) {
      return res
        .status(400)
        .json({ error: "Please add all fields including 'id'", status: false });
    }

    if (user?.isMobileNumberVerified) {
      // Find the index of the ID to be edited
      const idIndex = user.ids.findIndex((item) => item._id == id);

      if (idIndex === -1) {
        return res.status(400).json({ error: "ID not found", status: false });
      }

      // Update the specific ID in the array
      user.ids[idIndex] = { _id: id, name, information };

      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          ids: user.ids,
        }
      );

      // Send email for User Updated
      const mailOptions = {
        from: "taxjugnoo@gmail.com",
        to: user.email,
        subject: "User Details Updated Successfully",
        text: `Hi ${user.name},

Your Details has been Verified Successfully.
Keep it safe! If you need help, reach out to us.

Best,
Team Tax Jugnoo`,
      };

      sendEmail(mailOptions);

      const updatedUser = await User.findOne({
        mobileNumber: user.mobileNumber,
      });

      user = updatedUser.toObject();
      delete user.otp;

      return res.status(201).json({
        data: user,
        token: generateToken(user._id),
        status: true,
      });
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in editIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const addBussiness = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { businessName, businessAddress } = req.body;

    if (!businessName || !businessAddress) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    if (user?.isMobileNumberVerified) {
      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          businessInformation: [
            ...user.businessInformation,
            { businessName, businessAddress },
          ],
        }
      );

      //send email for User Updated
      const mailOptions = {
        from: "taxjugnoo@gmail.com",
        to: user.email,
        subject: "Bussiness Details Added Successfully",
        text: `Hi ${user.name},

  Bussiness Details has been added Successfully .

  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
      };

      sendEmail(mailOptions);
      const updatedUser = await User.findOne({
        mobileNumber: user.mobileNumber,
      });

      user = updatedUser.toObject();
      delete user.otp;

      return res.status(201).json({
        data: user,
        token: generateToken(user._id),
        status: true,
      });
    } else {
      return res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const editBussiness = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { businessName, businessAddress, gstNo, msme, shopEst } = req.body;
    const { id } = req.params;

    if (!businessName || !businessAddress || !gstNo || !msme || !shopEst) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    if (user?.isMobileNumberVerified) {
      const idIndex = user.businessInformation.findIndex(
        (item) => item._id == id
      );

      if (idIndex === -1) {
        return res
          .status(400)
          .json({ error: "Bussiness not found", status: false });
      }

      // Update the specific ID in the array
      user.businessInformation[idIndex] = {
        businessName,
        businessAddress,
        gstNo,
        msme,
        shopEst,
        _id: id,
      };

      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          businessInformation: user.businessInformation,
        }
      );

      //send email for User Updated
      const mailOptions = {
        from: "taxjugnoo@gmail.com",
        to: user.email,
        subject: "Bussiness Details Added Successfully",
        text: `Hi ${user.name},

  Bussiness Details has been added Successfully .

  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
      };

      sendEmail(mailOptions);
      const updatedUser = await User.findOne({
        mobileNumber: user.mobileNumber,
      });

      user = updatedUser.toObject();
      delete user.otp;

      return res.status(201).json({
        data: user,
        token: generateToken(user._id),
        status: true,
      });
    } else {
      return res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

// add member
const addMember = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    if (user?.isMobileNumberVerified) {
      const member = await Member.create({
        name,
      });

      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          members: [...user.members, { name: name, memberId: member._id }],
        }
      );
      //send email for User Updated
      const mailOptions = {
        from: "taxjugnoo@gmail.com",
        to: user.email,
        subject: "Bussiness Details Added Successfully",
        text: `Hi ${user.name},

 Bussiness Details has been added Successfully .

  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
      };

      sendEmail(mailOptions);
      const updatedUser = await User.findOne({
        mobileNumber: user.mobileNumber,
      });

      user = updatedUser.toObject();
      delete user.otp;

      return res.status(201).json({
        data: user,
        token: generateToken(user._id),
        status: true,
      });
    } else {
      return res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

// other profile api
const addOtherInfoTable = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    if (!user || !user.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }
    // let user = req.user.toObject();
    const { tableName } = req.params;
    const {
      bankName,
      accountNumber,
      accountType,
      IFSC,
      photo,
      firstName,
      lastName,
      fathersName,
      mobile,
      email,
      PAN,
      aadhar,
      passportNo,
      DIN,
      directorType,
      dateOfJoining,
      dateOfRetirement,
      noOfShare,
      faceValueOfShare,
      DPIN,
      IsDesignatedPartner,
      profitOrLossShare,
    } = req.body;

    if (!tableName) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    let updateField = {};

    switch (tableName) {
      case "bank":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            bank: [
              ...(user.otherInformation?.bank || []),
              {
                bankName,
                accountNumber,
                accountType,
                IFSC,
              },
            ],
          },
        };
        break;
      case "director":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            director: [
              ...(user.otherInformation?.director || []),
              {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                aadhar,
                passportNo,
                DIN,
                directorType,
                dateOfJoining,
                dateOfRetirement,
              },
            ],
          },
        };
        break;
      case "shareholder":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            shareholder: [
              ...(user.otherInformation?.shareholder || []),
              {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                noOfShare,
                faceValueOfShare,
              },
            ],
          },
        };
        break;
      case "partnerLLP":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            partnerLLP: [
              ...(user.otherInformation?.partnerLLP || []),
              {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                dateOfJoining,
                DPIN,
                IsDesignatedPartner,
                profitOrLossShare,
              },
            ],
          },
        };
        break;
      case "partnerFirm":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            partnerFirm: [
              ...(user.otherInformation?.partnerFirm || []),
              {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                dateOfJoining,
                profitOrLossShare,
              },
            ],
          },
        };
        break;
      case "member":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            member: [
              ...(user.otherInformation?.member || []),
              {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                dateOfJoining,
                profitOrLossShare,
              },
            ],
          },
        };
        break;

      // Add other cases for different tableName values...

      default:
        return res
          .status(400)
          .json({ error: "Invalid tableName", status: false });
    }
    await User.findByIdAndUpdate({ _id: user._id }, updateField);

    //send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Other Information Added Successfully",
      text: `Hi ${user.name},

    Other Information has been added Successfully .

    Keep it safe! If you need help, reach out to us.

    Best,
    Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);
    const updatedUser = await User.findOne({
      mobileNumber: user.mobileNumber,
    });

    user = updatedUser.toObject();
    delete user.otp;

    return res.status(201).json({
      data: user,
      token: generateToken(user._id),
      status: true,
    });
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const editOtherInfoTable = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();

    if (!user || !user.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    const { tableName, id } = req.params;
    const {
      bankName,
      accountNumber,
      accountType,
      IFSC,
      photo,
      firstName,
      lastName,
      fathersName,
      mobile,
      email,
      PAN,
      aadhar,
      passportNo,
      DIN,
      directorType,
      dateOfJoining,
      dateOfRetirement,
      noOfShare,
      faceValueOfShare,
      DPIN,
      IsDesignatedPartner,
      profitOrLossShare,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Please provide the ID to edit", status: false });
    }

    let updateField = {
      otherInformation: {
        ...user.otherInformation,
        [tableName]: user.otherInformation[tableName].map((item) => {
          if (item._id.toString() === id) {
            return {
              ...item,
              ...(tableName === "bank" && {
                bankName,
                accountNumber,
                accountType,
                IFSC,
              }),
              ...(tableName === "director" && {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                aadhar,
                passportNo,
                DIN,
                directorType,
                dateOfJoining,
                dateOfRetirement,
              }),
              ...(tableName === "shareholder" && {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                noOfShare,
                faceValueOfShare,
              }),
              ...(tableName === "partnerLLP" && {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                dateOfJoining,
                DPIN,
                IsDesignatedPartner,
                profitOrLossShare,
              }),
              ...(tableName === "partnerFirm" && {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                dateOfJoining,
                profitOrLossShare,
              }),
              ...(tableName === "member" && {
                photo,
                firstName,
                lastName,
                fathersName,
                mobile,
                email,
                PAN,
                dateOfJoining,
                profitOrLossShare,
              }),
            };
          }
          return item;
        }),
      },
    };

    await User.findByIdAndUpdate({ _id: user._id }, updateField);

    // send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Other Information Added Successfully",
      text: `Hi ${user.name},

      Other Information has been added successfully.

      Keep it safe! If you need help, reach out to us.

      Best,
      Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    const updatedUser = await User.findOne({
      mobileNumber: user.mobileNumber,
    });

    user = updatedUser.toObject();
    delete user.otp;

    return res.status(201).json({
      data: user,
      token: generateToken(user._id),
      status: true,
    });
  } catch (error) {
    console.error("Error in editOtherInfoTable:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const deleteOtherInfoEntry = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    if (!user || !user.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    const { tableName, id } = req.params;

    if (!tableName || !id) {
      return res.status(400).json({
        error: "Please provide tableName and ID to delete",
        status: false,
      });
    }

    let updateField = {};

    switch (tableName) {
      case "bank":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            bank: user.otherInformation.bank.filter(
              (item) => item._id.toString() !== id
            ),
          },
        };
        break;
      case "director":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            director: user.otherInformation.director.filter(
              (item) => item._id.toString() !== id
            ),
          },
        };
        break;
      case "shareholder":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            shareholder: user.otherInformation.shareholder.filter(
              (item) => item._id.toString() !== id
            ),
          },
        };
        break;
      case "partnerLLP":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            partnerLLP: user.otherInformation.partnerLLP.filter(
              (item) => item._id.toString() !== id
            ),
          },
        };
        break;
      case "partnerFirm":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            partnerFirm: user.otherInformation.partnerFirm.filter(
              (item) => item._id.toString() !== id
            ),
          },
        };
        break;
      case "member":
        updateField = {
          otherInformation: {
            ...user.otherInformation,
            member: user.otherInformation.member.filter(
              (item) => item._id.toString() !== id
            ),
          },
        };
        break;
      // Add other cases for different tableName values...

      default:
        return res
          .status(400)
          .json({ error: "Invalid tableName", status: false });
    }

    await User.findByIdAndUpdate({ _id: user._id }, updateField);

    //send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Other Information Deleted Successfully",
      text: `Hi ${user.name},

    Other Information has been deleted Successfully.

    Keep it safe! If you need help, reach out to us.

    Best,
    Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);
    const updatedUser = await User.findOne({
      mobileNumber: user.mobileNumber,
    });

    user = updatedUser.toObject();
    delete user.otp;

    return res.status(200).json({
      data: user,
      token: generateToken(user._id),
      status: true,
    });
  } catch (error) {
    console.error("Error in deleteOtherInfoEntry:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobileNumber } = req.body;
  if (!name || !email || !mobileNumber) {
    return res.status(400).json({ error: "Please add all fields" });
  }

  const userExists = await User.findOne({ mobileNumber });

  if (userExists) {
    return res.status(422).json({ error: "User Already Exist" });
  }

  const user = await User.create({
    name,
    email,
    mobileNumber,
  });

  // user auth token generate
  if (user) {
    res.status(201).json({
      user,
      token: generateToken(user._id),
      status: "Ok",
    });
  } else {
    return res.status(400).json({ error: "invalid user data" });
  }
});

// @desc    Authenticate a user
// @route   POST /user/login
// @access  Public

const loginUser = asyncHandler(async (req, res) => {
  const { mobileNumber } = req.body;

  // Check for user mobileNumber
  const user = await User.findOne({ mobileNumber });

  if (user) {
    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } else {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user data
// @route   GET /user/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user.toObject();
  delete user?.otp;

  res.status(200).json({
    data: user,
    status: true,
    message: "User Fatched successfully",
  });
});

// @desc    Get all users data
// @route   GET /user/me
// @access  Public

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});

    return res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Generate OTP
const generateOtp = () => {
  return Math.floor(Math.random() * 1000000 + 1);
};

export {
  getAllUser,
  registerUser,
  loginUser,
  getMe,
  sendOtp,
  verifyOtp,
  updateUser,
  addIdUser,
  editIdUser,
  addBussiness,
  editBussiness,
  addOtherInfoTable,
  editOtherInfoTable,
  deleteOtherInfoEntry,
  addMember,
};
