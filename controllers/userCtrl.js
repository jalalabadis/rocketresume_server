const personModel = require("../dbModels/personModel");
const { sendOtpEmail, generateRandomOTP } = require("../utils/otp");
const OTP = require("../dbModels/otpModel");
const { storeOtpInDB } = require("./otpCtrl");
const asynchandler = require("express-async-handler");
const adminModel = require("../dbModels/adminModel");
const userModel = require("../dbModels/userModel");
const Subscription = require("../dbModels/subscriptionModel"); // Import the Subscription model

exports.registerCtrl = asynchandler(async (req, res) => {
  const { email, password, role, name, phno } = req.body;

  // Validate required fields
  if (!email || !password || !role || !name || !phno) {
    return res.status(400).json({
      status: "Failed",
      message: "All required fields must be provided",
    });
  }

  // Ensure the role is either 'person' or 'admin'
  if (role !== "person" && role !== "admin") {
    return res.status(400).json({
      status: "Failed",
      message:
        "Invalid role specified. Role must be either 'person' or 'admin'.",
    });
  }

  // Check if the email is already registered
  const userFound = await userModel.findOne({ email });
  if (userFound) {
    return res.status(400).json({
      status: "Failed",
      message: "Email already exists",
    });
  }

  // Create a new user
  const createdUser = await userModel.create({
    email,
    password,
    role,
  });

  try {
    let createdEntity;

    if (role === "person") {
      // Save additional details in personModel
      const personDetails = {
        name,
        phno,
        user_id: createdUser._id,
      };
      createdEntity = new personModel(personDetails);
    } else if (role === "admin") {
      // Save additional details in adminModel
      const adminDetails = {
        name,
        phno,
        user_id: createdUser._id,
      };
      createdEntity = new adminModel(adminDetails);
    }

    // Save the corresponding model
    await createdEntity.save();

    // Create a free subscription for the user
    const subscription = new Subscription({
      userId: createdUser._id, // Link the subscription to the user
      planName: "free", // Set the plan to "free"
      resumeLimit: "0", // Default resume limit for free plan
      status: "active", // Set the subscription status to active
      downloadsRemaining: 0, // Set the downloads remaining to 0
    });

    await subscription.save(); // Save the subscription

    return res.status(200).json({
      status: "Success",
      message: "Account registered successfully",
      user: createdUser,
      details: createdEntity,
      subscription, // Include the subscription details in the response
    });
  } catch (error) {
    console.log(error);
    await userModel.findByIdAndDelete(createdUser._id); // Rollback user creation
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
});

exports.sendOtpCtrl = asynchandler(async (req, res) => {
  const { email } = req.params;
  console.log(email);
  // Check if email exists in the UserModel
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      status: "Failed",
      message: "Email already exists",
    });
  }

  // Delete any existing OTPs for the email
  await OTP.deleteMany({ email });
  console.log(email);

  // Generate OTP and send via email
  const otp = generateRandomOTP();
  console.log("OTP : ", otp);

  const resp = await sendOtpEmail(email, otp);
  if (resp) {
    // Store OTP in the database
    await storeOtpInDB(email, otp);
    return res.status(200).json({
      status: "Success",
      message: "OTP sent successfully",
      otp: otp,
    });
  } else {
    return res.status(400).json({
      status: "Failed",
      message: "OTP not sent",
    });
  }
});

exports.googleSignupCtrl = asynchandler(async (req, res) => {
  const { name, email, googleUid } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (user) {
      if (!user.googleUid) {
        user.googleUid = googleUid;
        await user.save();
        console.log("1");
        return res.json({
          status: "Success",
          message: "Google UID added to existing account",
          userID: user._id,
          role: user.role,
        });
      } else {
        console.log("2");
        return res.json({
          status: "Success",
          message: "User already Exists. ",
          userID: user._id,
          role: user.role,
        });
      }
    }
    const newUser = await userModel.create({
      email,
      googleUid,
      role: "user",
    });

    try {
      const personDetails = {
        name: name,
        phno: "",
        user_id: newUser._id,
      };

      createdPerson = new personModel({
        ...personDetails,
      });

      await createdPerson.save();

      return res.json({
        status: "Success",
        message: "Google Sign-Up Successful",
        userID: newUser._id,
        role: newUser.role,
      });
    } catch (error) {
      console.log(error);
      await userModel.findByIdAndDelete(newUser._id);
      return res.json({
        status: "Failed",
        message: "Internal server error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error during Google Sign-Up:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
});

exports.loginCtrl = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  const userFound = await userModel.findOne({ email });

  if (!userFound) {
    return res.json({
      status: "Failed",
      message: "Email not found",
    });
  }
  const personFound = await personModel.findOne({ user_id: userFound._id });
  if (userFound.password === password) {
    return res.json({
      status: "Success",
      message: "Login Successfully",
      userID: userFound._id,
      role: userFound.role,
      email: userFound.email,
      name: personFound.name,
    });
  } else {
    return res.json({
      status: "Failed",
      message: "Password not Matched",
    });
  }
});

exports.getUserProfileCtrl = asynchandler(async (req, res) => {
  const { userId } = req.params;

  // Validate the user ID
  if (!userId) {
    return res.status(400).json({
      status: "Failed",
      message: "User ID is required",
    });
  }

  try {
    // Find the user in the userModel
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }

    let profileDetails;

    // Fetch additional details based on the user's role
    if (user.role === "person") {
      profileDetails = await personModel.findOne({ user_id: userId });
    } else if (user.role === "admin") {
      profileDetails = await adminModel.findOne({ user_id: userId });
    }

    if (!profileDetails) {
      return res.status(404).json({
        status: "Failed",
        message: "Profile details not found",
      });
    }

    // Return the user profile
    return res.status(200).json({
      status: "Success",
      message: "User profile retrieved successfully",
      user: {
        email: user.email,
        role: user.role,
      },
      profile: profileDetails,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
});
