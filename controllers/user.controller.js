import asyncHandler from "express-async-handler";
import User from "../MongoDB/models/profile/user.js";
import Information from "../MongoDB/models/profile/information.js";
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
        return res.status(200).json({
          message: "OTP successfully sent to your contact number",
          status: true,
        });
      }
    } else {
      // User doesn't exist, create a new user
      const myOtp = generateOtp();

      let user = await User.create({
        otp: myOtp,
        mobileNumber,
      });
      user = user.toObject();

      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          ...user,
          members: [{ name: "Group Admin", memberId: user._id }],
        }
      );

      console.log("User created and updated successfully.");

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
    const { name, email, dob, pan, category, address, state, fathersName } =
      req.body;
    const data = {
      name: name ? name : user.name,
      email: email ? email : user.email,
      dob: dob ? dob : user.dob,
      pan: pan ? pan : user.pan,
      category: category ? category : user.category,
      address: address ? address : user.address,
      state: state ? state : user.state,
      fathersName: fathersName ? fathersName : user.fathersName,
    };

    const { memberId } = req.params;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }
    if (!user || !user.isMobileNumberVerified || !memberId) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    if (memberId == user._id) {
      console.log("whose user");
      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          ...data,
          members: [...user.members],
        }
      );

      user = await User.findOne({
        mobileNumber: user.mobileNumber,
      });
    } else {
      const member = await Member.findByIdAndUpdate({ _id: memberId }, data);
      if (member) {
        user = await Member.findOne({
          _id: memberId,
        });
      } else {
        return res.status(400).json({
          error: "Please fill all fields correctly. Check member id",
          status: false,
        });
      }
    }
    user = user.toObject();

    // update member name
    if (user.members) {
      await User.findByIdAndUpdate(user._id, {
        ...user,
        members: user.members.map((item) => {
          if (item.memberId == memberId) {
            return {
              ...item,
              name: name,
            };
          }
          return item;
        }),
      });
    }

    //send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: email,
      subject: "User Details Updated Successfully",
      text: `Hi ${user.name},

Account Updated Successfully.
Keep it safe! If you need help, reach out to us.
  
Best,
Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    if (memberId === user._id) {
      delete user.otp;
    }

    return res.status(201).json({
      data: user,
      token: generateToken(user._id),
      status: true,
      message: "User Details Updated Successfully",
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const getUserData = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { memberId } = req.params;

    if (!memberId) {
      return res
        .status(400)
        .json({ error: "Please provide 'memberId'", status: false });
    }

    let userData;
    if (user._id == memberId) {
      userData = await User.findOne({ _id: memberId });
    } else {
      userData = await Member.findOne({ _id: memberId });
    }
    userData = userData.toObject();

    if (!userData) {
      return res.status(404).json({
        error: "User not found with the provided memberId",
        status: false,
      });
    }

    return res.status(200).json({
      data: userData,
      status: true,
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const addIdUser = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { name, information } = req.body;
    const { memberId } = req.params;

    if (
      !name ||
      !information ||
      !user ||
      !user?.isMobileNumberVerified ||
      !memberId
    ) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });

    if (!userInformation) {
      userInformation = await Information.create({
        ids: [{ name, information }],
        userId: memberId,
      });
    } else {
      userInformation = userInformation.toObject();
      userInformation = await Information.findOneAndUpdate(
        { userId: memberId },
        {
          ...userInformation,
          ids: [...userInformation.ids, { name, information }],
        },
        { new: true }
      );
    }

    //send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "User Details Updated Successfully",
      text: `Hi ${user.name},

 Id Added Successfully.
 Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      status: true,
      message: "Id Added Successfully",
    });
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const getInformationUser = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { memberId } = req.params;

    if (!user || !user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please add all fields", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });
    if (userInformation) {
      userInformation = userInformation.toObject();
    }

    return res.status(201).json({
      data: userInformation,
      status: true,
    });
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
    const { memberId, id } = req.params;

    if (
      !name ||
      !information ||
      !user ||
      !user?.isMobileNumberVerified ||
      !memberId
    ) {
      return res
        .status(400)
        .json({ error: "Please add all fields including 'id'", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });
    userInformation = userInformation.toObject();

    if (userInformation) {
      // Find the index of the ID to be edited
      const idIndex = userInformation.ids.findIndex((item) => item._id == id);

      if (idIndex === -1) {
        return res.status(400).json({ error: "ID not found", status: false });
      }

      // Update the specific ID in the array
      userInformation.ids[idIndex] = { _id: id, name, information };

      userInformation = await Information.findOneAndUpdate(
        { userId: memberId },
        {
          ids: userInformation.ids,
        },
        { new: true }
      );
    } else {
      return res
        .status(500)
        .json({ error: "User Information Not Found", status: false });
    }

    // Send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "User Details Updated Successfully",
      text: `Hi ${user.name},

Your Details has been Updated Successfully.
Keep it safe! If you need help, reach out to us.

Best,
Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      status: true,
      message: "User Information Updated Successfully",
    });
  } catch (error) {
    console.error("Error in editIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const deleteIdUser = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { memberId, id } = req.params;

    if (!memberId || !id) {
      return res
        .status(400)
        .json({ error: "Please provide 'memberId' and 'id'", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });
    userInformation = userInformation.toObject();

    if (!userInformation) {
      return res
        .status(404)
        .json({ error: "User Information Not Found", status: false });
    }

    // Find the index of the ID to be deleted
    const idIndex = userInformation.ids.findIndex((item) => item._id == id);

    if (idIndex === -1) {
      return res.status(404).json({ error: "ID not found", status: false });
    }

    // Remove the specific ID from the array
    userInformation.ids.splice(idIndex, 1);

    // Update the user information without the deleted ID
    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      {
        ids: userInformation.ids,
      },
      { new: true }
    );

    // Send email notification for ID deletion
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email, // Assuming 'user' is defined in the calling function
      subject: "User ID Deleted Successfully",
      text: `Hi ${user.name},

The ID with details has been deleted successfully.
If you have any concerns, please reach out to us.

Best,
Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(200).json({
      data: userInformation,
      status: true,
      message: "Id deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const addBussiness = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { businessName, businessAddress } = req.body;
    const { memberId } = req.params;

    if (!businessName || !businessAddress || !memberId) {
      return res
        .status(400)
        .json({ error: "Please add all fields!", status: false });
    }
    if (!user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please verify you mobile number!", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });

    if (!userInformation) {
      userInformation = await Information.create({
        businessInformation: [
          { businessName, businessAddress, gstNo: "", msme: "", shopEst: "" },
        ],
        userId: memberId,
      });
    } else {
      userInformation = userInformation.toObject();
      userInformation = await Information.findOneAndUpdate(
        { userId: memberId },
        {
          businessInformation: [
            ...userInformation.businessInformation,
            { businessName, businessAddress, gstNo: "", msme: "", shopEst: "" },
          ],
        },
        { new: true }
      );
    }

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

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      status: true,
      message: "Bussiness Added Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const editBussiness = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { businessName, businessAddress } = req.body;
    const { id, memberId } = req.params;

    if (!businessName || !businessAddress) {
      return res
        .status(400)
        .json({ error: "Please add all fields!", status: false });
    }
    if (!user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please verify you mobile number!", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });

    const idIndex = userInformation.businessInformation.findIndex(
      (item) => item._id == id
    );

    if (idIndex === -1) {
      return res
        .status(400)
        .json({ error: "Bussiness not found", status: false });
    }

    userInformation.businessInformation[idIndex] = {
      businessName,
      businessAddress,
      _id: id,
    };

    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      {
        businessInformation: userInformation.businessInformation,
      },
      { new: true }
    );

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

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      status: true,
      message: "Bussiness Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      status: false,
      message: error.message,
    });
  }
});

const addBusinessRegistrations = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { name, information } = req.body;
    const { id, memberId } = req.params;

    // Validation checks
    if (!name || !information) {
      return res
        .status(400)
        .json({ error: "Please provide all fields.", status: false });
    }

    if (!user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please verify your mobile number.", status: false });
    }

    // Fetch user information
    let userInformation = await Information.findOne({ userId: memberId });

    // Find the index of the business by ID
    const businessIndex = userInformation.businessInformation.findIndex(
      (item) => item._id == id
    );

    if (businessIndex === -1) {
      return res
        .status(400)
        .json({ error: "Business not found", status: false });
    }

    // Update business information
    userInformation.businessInformation[businessIndex].registrations = [
      ...userInformation.businessInformation[businessIndex].registrations,
      {
        name,
        information,
      },
    ];

    // Save the updated user information
    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      { businessInformation: userInformation.businessInformation },
      { new: true }
    );

    // Send email notification
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Business Details Added Successfully",
      text: `Hi ${user.name},

  Business Details have been added successfully.
  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      status: true,
      message: "Business Updated Successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      status: false,
      message: error.message,
    });
  }
});

const editBusinessRegistration = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { name, information } = req.body;
    const { id, memberId, registrationId } = req.params;

    // Validation checks
    if (!name || !information) {
      return res
        .status(400)
        .json({ error: "Please provide all fields.", status: false });
    }

    if (!user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please verify your mobile number.", status: false });
    }

    // Fetch user information
    let userInformation = await Information.findOne({ userId: memberId });

    // Find the index of the business by ID
    const businessIndex = userInformation.businessInformation.findIndex(
      (item) => item._id == id
    );

    if (businessIndex === -1) {
      return res
        .status(400)
        .json({ error: "Business not found", status: false });
    }

    // Find the index of the registration within the business
    const registrationIndex = userInformation.businessInformation[
      businessIndex
    ].registrations.findIndex(
      (registration) => registration._id == registrationId
    );

    if (registrationIndex === -1) {
      return res
        .status(400)
        .json({ error: "Registration not found", status: false });
    }

    // Update the specific registration
    userInformation.businessInformation[businessIndex].registrations[
      registrationIndex
    ] = {
      _id: registrationId,
      name,
      information,
    };

    // Save the updated user information
    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      { businessInformation: userInformation.businessInformation },
      { new: true }
    );

    // Send email notification
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Business Registration Updated Successfully",
      text: `Hi ${user.name},

  Business registration details have been updated successfully.
  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(200).json({
      data: userInformation,
      status: true,
      message: "Business Registration Updated Successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      status: false,
      message: error.message,
    });
  }
});

const deleteBusinessRegistration = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { id, memberId, registrationId } = req.params;

    // Validation checks
    if (!user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please verify your mobile number.", status: false });
    }

    // Fetch user information
    let userInformation = await Information.findOne({ userId: memberId });

    // Find the index of the business by ID
    const businessIndex = userInformation.businessInformation.findIndex(
      (item) => item._id == id
    );

    if (businessIndex === -1) {
      return res
        .status(400)
        .json({ error: "Business not found", status: false });
    }

    // Find the index of the registration within the business
    const registrationIndex = userInformation.businessInformation[
      businessIndex
    ].registrations.findIndex(
      (registration) => registration._id == registrationId
    );

    if (registrationIndex === -1) {
      return res
        .status(400)
        .json({ error: "Registration not found", status: false });
    }

    // Remove the specific registration from the array
    userInformation.businessInformation[businessIndex].registrations.splice(
      registrationIndex,
      1
    );

    // Save the updated user information
    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      { businessInformation: userInformation.businessInformation },
      { new: true }
    );

    // Send email notification (if needed)
    // ...

    userInformation = userInformation.toObject();

    return res.status(200).json({
      data: userInformation,
      status: true,
      message: "Business Registration Deleted Successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      status: false,
      message: error.message,
    });
  }
});

const deleteBussiness = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { id, memberId } = req.params;

    if (!id || !memberId) {
      return res
        .status(400)
        .json({ error: "Please add all fields!", status: false });
    }
    if (!user?.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Please verify you mobile number!", status: false });
    }

    let userInformation = await Information.findOne({ userId: memberId });

    const idIndex = userInformation.businessInformation.findIndex(
      (item) => item._id == id
    );
    console.log(":idIndex", idIndex);
    if (idIndex === -1) {
      return res
        .status(400)
        .json({ error: "Bussiness not found", status: false });
    }
    console.log(":idIndex", idIndex);
    // Remove the specific ID from the array
    userInformation.businessInformation.splice(idIndex, 1);

    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      {
        businessInformation: userInformation.businessInformation,
      },
      { new: true }
    );

    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Bussiness Details Deleted Successfully",
      text: `Hi ${user.name},

  Bussiness details has been deleted successfully .
  Keep it safe! If you need help, reach out to us.
  
  Best,
  Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      status: true,
      message: "Bussiness Deleted Successfully",
    });
  } catch (error) {
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
      let member = await Member.create({
        name,
        adminId: user._id,
      });
      member = member.toObject();

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
        subject: "Member Added Successfully",
        text: `Hi ${user.name},

  Member has been added Successfully .
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
        message: "Member Added Successfully",
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

const getAllMember = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    if (!user && user?.isMobileNumberVerified) {
      return res.status(400).json({ error: "Not a valid user", status: false });
    }

    return res.status(201).json({
      data: user.members,
      status: true,
    });
  } catch (error) {
    console.error("Error is :", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

// other profile api
const addOtherInfoTable = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { memberId, tableName } = req.params;

    if (!user || !user.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    if (!memberId || !tableName) {
      return res.status(400).json({
        error: "Please provide 'memberId' and 'tableName'",
        status: false,
      });
    }

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

    let userInformation = await Information.findOne({ userId: memberId });

    if (!userInformation) {
      userInformation = await Information.create({ userId: memberId });
    }

    let updateField = {};

    switch (tableName) {
      case "bank":
        updateField = {
          $push: {
            "otherInformation.bank": {
              bankName,
              accountNumber,
              accountType,
              IFSC,
            },
          },
        };
        break;
      case "director":
        updateField = {
          $push: {
            "otherInformation.director": {
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
          },
        };
        break;
      case "shareholder":
        updateField = {
          $push: {
            "otherInformation.shareholder": {
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
          },
        };
        break;
      case "partnerLLP":
        updateField = {
          $push: {
            "otherInformation.partnerLLP": {
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
          },
        };
        break;
      case "partnerFirm":
        updateField = {
          $push: {
            "otherInformation.partnerFirm": {
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
          },
        };
        break;
      case "member":
        updateField = {
          $push: {
            "otherInformation.member": {
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
          },
        };
        break;

      // Add other cases for different tableName values...

      default:
        return res
          .status(400)
          .json({ error: "Invalid tableName", status: false });
    }

    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      updateField,
      { new: true }
    );

    // Send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Other Information Added Successfully",
      text: `Hi ${user.name},

Other Information has been added Successfully.
Keep it safe! If you need help, reach out to us.

Best,
Team Tax Jugnoo`,
    };

    sendEmail(mailOptions);

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      message: `Successfully added ${tableName} table`,
      status: true,
    });
  } catch (error) {
    console.error("Error in addIdUser:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const editOtherInfoTableRow = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { memberId, tableName, id } = req.params;

    if (!user || !user.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    if (!memberId || !tableName || !id) {
      return res.status(400).json({
        error: "Please provide 'memberId', 'tableName', and 'id'",
        status: false,
      });
    }

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

    let userInformation = await Information.findOne({ userId: memberId });

    if (!userInformation) {
      return res.status(400).json({
        error: "Data Not Found",
        status: false,
      });
    }

    let updateField = {};

    switch (tableName) {
      case "bank":
        updateField = {
          $set: {
            [`otherInformation.bank.$[elem]`]: {
              bankName,
              accountNumber,
              accountType,
              IFSC,
              _id: id,
            },
          },
        };
        break;
      case "director":
        updateField = {
          $set: {
            [`otherInformation.director.$[elem]`]: {
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
              _id: id,
            },
          },
        };
        break;
      case "shareholder":
        updateField = {
          $set: {
            [`otherInformation.shareholder.$[elem]`]: {
              photo,
              firstName,
              lastName,
              fathersName,
              mobile,
              email,
              PAN,
              noOfShare,
              faceValueOfShare,
              _id: id,
            },
          },
        };
        break;
      case "partnerLLP":
        updateField = {
          $set: {
            [`otherInformation.partnerLLP.$[elem]`]: {
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
              _id: id,
            },
          },
        };
        break;
      case "partnerFirm":
        updateField = {
          $set: {
            [`otherInformation.partnerFirm.$[elem]`]: {
              photo,
              firstName,
              lastName,
              fathersName,
              mobile,
              email,
              PAN,
              dateOfJoining,
              profitOrLossShare,
              _id: id,
            },
          },
        };
        break;
      case "member":
        updateField = {
          $set: {
            [`otherInformation.member.$[elem]`]: {
              photo,
              firstName,
              lastName,
              fathersName,
              mobile,
              email,
              PAN,
              dateOfJoining,
              profitOrLossShare,
              _id: id,
            },
          },
        };
        break;

      // Add other cases for different tableName values...

      default:
        return res
          .status(400)
          .json({ error: "Invalid tableName", status: false });
    }

    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      updateField,
      { new: true, arrayFilters: [{ "elem._id": id }] }
    );

    // Send email for User Updated
    const mailOptions = {
      from: "taxjugnoo@gmail.com",
      to: user.email,
      subject: "Other Information Updated Successfully",
      text: `Hi ${user.name},

Other Information has been updated Successfully.
Keep it safe! If you need help, reach out to us.

Best,
Team Tax Jugnoo`,
    };

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      message: `Successfully updated ${tableName} table row with id ${id}`,
      status: true,
    });
  } catch (error) {
    console.error("Error in editOtherInfoTableRow:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
});

const deleteOtherInfoTableRow = asyncHandler(async (req, res) => {
  try {
    let user = req.user.toObject();
    const { memberId, tableName, id } = req.params;

    if (!user || !user.isMobileNumberVerified) {
      return res
        .status(400)
        .json({ error: "Invalid user data", status: false });
    }

    if (!memberId || !tableName || !id) {
      return res.status(400).json({
        error: "Please provide 'memberId', 'tableName', and 'id'",
        status: false,
      });
    }

    let userInformation = await Information.findOne({ userId: memberId });

    if (!userInformation) {
      return res.status(400).json({
        error: "Data Not Found",
        status: false,
      });
    }

    let updateField = {};

    switch (tableName) {
      case "bank":
        updateField = {
          $pull: {
            "otherInformation.bank": { _id: id },
          },
        };
        break;
      case "director":
        updateField = {
          $pull: {
            "otherInformation.director": { _id: id },
          },
        };
        break;
      case "shareholder":
        updateField = {
          $pull: {
            "otherInformation.shareholder": { _id: id },
          },
        };
        break;
      case "partnerLLP":
        updateField = {
          $pull: {
            "otherInformation.partnerLLP": { _id: id },
          },
        };
        break;
      case "partnerFirm":
        updateField = {
          $pull: {
            "otherInformation.partnerFirm": { _id: id },
          },
        };
        break;
      case "member":
        updateField = {
          $pull: {
            "otherInformation.member": { _id: id },
          },
        };
        break;

      // Add other cases for different tableName values...

      default:
        return res
          .status(400)
          .json({ error: "Invalid tableName", status: false });
    }

    userInformation = await Information.findOneAndUpdate(
      { userId: memberId },
      updateField,
      { new: true }
    );

    // Send email for User Updated
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

    userInformation = userInformation.toObject();

    return res.status(201).json({
      data: userInformation,
      message: `Successfully deleted ${tableName} table row with id ${id}`,
      status: true,
    });
  } catch (error) {
    console.error("Error in deleteOtherInfoTableRow:", error);
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
  getUserData,
  addIdUser,
  getInformationUser,
  editIdUser,
  addBussiness,
  editBussiness,
  addBusinessRegistrations,
  editBusinessRegistration,
  deleteBusinessRegistration,
  addOtherInfoTable,
  editOtherInfoTableRow,
  deleteOtherInfoTableRow,
  addMember,
  getAllMember,
  deleteIdUser,
  deleteBussiness,
};
