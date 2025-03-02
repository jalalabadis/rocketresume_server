const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../dbModels/userModel");
const Resume = require("../dbModels/resumeModel");
const LiveChat = require("../dbModels/liveChatModel");
const Subscription = require("../dbModels/subscriptionModel");


//////Login Admin
router.post('/login', async (req, res) => {
  try {
    if (req.body.userName==="admin"&&req.body.pass==="1234") {
        const token = jwt.sign({ userID: req.body.userName }, "fsdf@5533", { expiresIn: '7d' });
        res.status(200).json({Status: true, token });
    } else {
      res.status(200).json({Status: false, Message:"Incorrect password"});
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({Status: false, Message:'Internal Server Error'});
  }
});



//////DashBoard Admin
router.post('/dashboard', async (req, res) => {
    try {
        const users = await User.countDocuments();
        const resumes = await Resume.countDocuments();
        const support = await LiveChat.countDocuments({ status: false });
        res.status(200).json({ users, resumes, support});
       
    } catch (err) {
      console.log(err);
      res.status(200).json({Status: false, Message:'Internal Server Error'});
    }
  });

///all user
  router.post('/all-user', async (req, res) => {
    try {
        const users = await User.find(); // সমস্ত ইউজার নিয়ে আসবে
        res.status(200).json(users);
       

    } catch (err) {
      console.log(err);
      res.status(200).json({Status: false, Message:'Internal Server Error'});
    }
  });
///all resumes
router.post('/all-resumes', async (req, res) => {
    try {
        const resumes = await Resume.find().populate("userId", "email").sort({ createdAt: -1 });

        const progressData = resumes.map(resume => {
            let completedSteps = 0;
            const totalSteps = 6; // মোট ৬টি ধাপ রয়েছে

            // যদি complete == true হয়, তাহলে সরাসরি ১০০% সেট করবো
            if (resume.complete === true) {
                return {
                    ...resume.toObject(),
                    completedSteps: totalSteps+1, 
                    progressPercentage: 100, 
                };
            }

            // অন্যথায় প্রতিটি ধাপ চেক করে গুণবো
            if (resume.personalInfo && Object.keys(resume.personalInfo).length > 0) completedSteps++;
            if (resume.education && resume.education.length > 0) completedSteps++;
            if (resume.experience && resume.experience.length > 0) completedSteps++;
            if (resume.skills && resume.skills.length > 0) completedSteps++;
            if (resume.interests && resume.interests.length > 0) completedSteps++;
            if (resume.additionalSections && resume.additionalSections.length > 0) completedSteps++;

            return {
                ...resume.toObject(), // রেজিউমের তথ্যের সাথে প্রগ্রেস যোগ করা
                completedSteps,
                progressPercentage: (completedSteps / totalSteps) * 100, 
            };
        });

        res.status(200).json(progressData);

    } catch (err) {
        console.log(err);
        res.status(500).json({ Status: false, Message: 'Internal Server Error' });
    }
});


// Export router
module.exports = router;