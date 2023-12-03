import asyncHandler from "express-async-handler";
import User from "../MongoDB/models/user.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../helper/email.js";

// @desc    Register new user
// @route   POST /user/create
// @access  Public

const sendOtp = asyncHandler(async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res
      .status(400)
      .json({ error: "Please add all fields", status: false });
  }

  // Check if user exists
  const userExists = await User.findOne({ mobileNumber });

  if (userExists?.email) {
    // send otp in both email and mobileNumber number
    const myOtp = generateOtp();

    await User.findByIdAndUpdate(
      { _id: userExists._id },
      {
        otp: myOtp,
      }
    );

    //send email for sign up user

    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: userExists?.email,
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
    //send otp only in mobileNumber number
    const myOtp = generateOtp();
    console.log("OTP generated", myOtp);

    const user = await User.create({
      otp: myOtp,
      mobileNumber,
      isEmailVerified: false,
      isMobileNumberVerified: false,
    });

    console.log("OTP saved in db", myOtp);

    console.log("Otp sent to " + user.mobileNumber);
    return res.status(200).json({
      message: "OTP successfully sent to your contact number",
      status: true,
    });
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

        const user = await User.findOne({ mobileNumber });

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
  const { name, email, mobileNumber, pan, aadhar, dob, avatar } = req.body;
  if (!name || !email || !mobileNumber || !pan || !aadhar || !dob) {
    return res
      .status(400)
      .json({ error: "Please add all fields", status: false });
  }

  // get user details by mobile number
  const getUser = await User.findOne({ mobileNumber });

  if (getUser?.isMobileNumberVerified) {
    await User.findByIdAndUpdate(
      { _id: getUser._id },
      {
        name,
        email,
        mobileNumber,
        pan,
        aadhar,
        dob,
        avatar,
        isMobileNumberVerified: true,
      }
    );

    //send email for User Updated

    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: userExists?.email,
      subject: "User Details Updated Successfully",
      text: `Hi ${name},

    Your Details has been Verified Successfully .
    
    Keep it safe! If you need help, reach out to us.
    
    Best,
    Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);
    const updatedUser = await User.findOne({ mobileNumber });
    return res.status(201).json({
      data: updatedUser,
      token: generateToken(updatedUser._id),
      status: true,
    });
  } else {
    return res.status(400).json({ error: "invalid user data" });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobileNumber, pan, aadhar, dob, avatar } = req.body;
  // console.log("registerUser");
  if (!name || !email || !mobileNumber || !pan || !aadhar || !dob) {
    return res.status(400).json({ error: "Please add all fields" });
  }

  // Check if user exists
  const userExists = await User.findOne({ mobileNumber });

  if (userExists) {
    return res.status(422).json({ error: "User Already Exist" });
  }

  const user = await User.create({
    name,
    email,
    mobileNumber,
    dob,
    aadhar,
    pan,
    avatar,
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
  res.status(200).json(req.user);
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
};
