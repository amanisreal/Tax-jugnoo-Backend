import asyncHandler from "express-async-handler";
import User from "../MongoDB/models/user.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// @desc    Register new user
// @route   POST /user/create
// @access  Public

const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: "Please add all fields" });
  }

  // Check if user exists
  const userExists = await User.findOne({ mobile });

  if (userExists) {
    // send otp in both email and mobile number
    const myOtp = generateOtp();

    await User.findByIdAndUpdate(
      { _id: userExists._id },
      {
        otp: myOtp,
      }
    );

    console.log("OTP saved in db", myOtp);

    console.log(
      "Otp sent to  " + userExists.email + "and " + userExists.mobile
    );
    return res.status(200).json({
      message: "OTP successfully sent to your email and contact number",
      status: true,
    });
  } else {
    //send otp only in mobile number
    const myOtp = generateOtp();
    console.log("OTP generated", myOtp);

    const user = await User.create({
      otp: myOtp,
      mobile,
    });

    console.log("OTP saved in db", myOtp);

    console.log("Otp sent to " + user.mobile);
    return res.status(200).json({
      message: "OTP successfully sent to your contact number",
      status: true,
    });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, pan, aadhar, dob, avatar } = req.body;
  // console.log("registerUser");
  if (!name || !email || !mobile || !pan || !aadhar || !dob) {
    return res.status(400).json({ error: "Please add all fields" });
  }

  // Check if user exists
  const userExists = await User.findOne({ mobile });

  if (userExists) {
    return res.status(422).json({ error: "User Already Exist" });
  }

  // Hash password
  // const salt = await bcrypt.genSalt(10)
  // const hashedPassword = await bcrypt.hash(password, salt)

  // Create user

  const user = await User.create({
    name,
    email,
    mobile,
    dob,
    aadhar,
    pan,
    avatar,
  });

  //send email for sign up user
  const transporter = nodemailer.createTransport({
    // Configure this with your email service provider details
    service: "gmail",
    auth: {
      user: "taxjugnoo@gmail.com",
      pass: "Taxjugnoo@1234",
    },
  });

  const mailOptions = {
    from: "taxjugnoo@gmail.com",
    to: email,
    subject: "Welcome to Tax jugnoo",
    text: "Thank you for signing up!",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
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
  const { mobile } = req.body;

  // Check for user mobile
  const user = await User.findOne({ mobile });

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

export { getAllUser, registerUser, loginUser, getMe, sendOtp };
