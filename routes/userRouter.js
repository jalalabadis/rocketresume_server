const express = require("express");

const {
  sendOtpCtrl,
  googleSignupCtrl,
  registerCtrl,
  loginCtrl,
  getUserProfileCtrl,
} = require("../controllers/userCtrl");
// const { verifyOtp } = require("../utils/otp");
const userRouter = express();
userRouter.post("/register", registerCtrl);
// userRouter.post("/register",
//     registerCtrl
// );
// userRouter.post("/sendOTP/:email", sendOtpCtrl);//nnnnnnnn
userRouter.post("/google-signup", googleSignupCtrl);
userRouter.post("/login", loginCtrl);
userRouter.get("/profile/:userId", getUserProfileCtrl);

module.exports = userRouter;
