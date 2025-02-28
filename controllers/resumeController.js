const Resume = require("../dbModels/resumeModel");
const subscriptionModel = require("../dbModels/subscriptionModel");


exports.createDraftResume = async (req, res) => {
  try {
    const {
      userId,
      personalInfo,
      education,
      experience,
      skills,
      interests,
      certifications,
      additionalSections,
    } = req.body;

    const newResume = new Resume({
      userId,
      resumeName: personalInfo.fullName,
      personalInfo,
      education,
      experience,
      skills,
      interests,
      certifications,
      additionalSections,
      complete: false
    });

    const savedResume = await newResume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving resume", error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const draftId = req.params.id;

    const {
      userId,
      personalInfo,
      education,
      experience,
      skills,
      interests,
      certifications,
      additionalSections,
    } = req.body;

    const updatedResume = await Resume.findByIdAndUpdate(
      draftId,
      {
        resumeName: personalInfo?.fullName || "Untitled Resume",
        personalInfo,
        education,
        experience,
        skills,
        interests,
        certifications,
        additionalSections,
        complete: false, // এটি প্রয়োজন অনুযায়ী ঠিক করো
      },
      { new: true, runValidators: true } // নতুন ডাটা ফেরত দেবে এবং ভ্যালিডেশন চেক করবে
    );

    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({
      message: "Resume updated successfully",
      resume: updatedResume,
    });
  } catch (error) {
    console.error("Update Resume Error:", error.message);
    res.status(500).json({ message: "Error updating resume", error: error.message });
  }
};

exports.getDraftResume = async (req, res) => {
  try {
    const userId = req.query.userId;

    const resumes = await Resume.findOne({ userId, complete: false });
    if (resumes&&resumes.length === 0) {
      return res
        .status(404)
        .json({ message: "No resumes found for this user" });
    }

    res.setHeader("Content-Type", "application/json"); // Explicitly set the headeer
    res.status(200).json({success: true, data: resumes});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching resumes", error: error.message });
  }
};


exports.saveResume = async (req, res) => {
  try {
    const {
      id, // Resume ID
      userId,
      personalInfo,
      education,
      experience,
      skills,
      interests,
      certifications,
      additionalSections,
    } = req.body;

    let savedResume; // এখানে সংরক্ষিত রিজিউম রাখা হবে

    // কমন ফাংশন যা নতুন রিজিউম তৈরি করবে
    const createNewResume = (completeStatus) => {
      return new Resume({
        userId,
        resumeName: personalInfo?.fullName || "Untitled Resume",
        personalInfo,
        education,
        experience,
        skills,
        interests,
        certifications,
        additionalSections,
        complete: completeStatus, // এইটা dynamic হতে পারে
      });
    };

    // 1. চেক করুন যে id আছে কিনা
    if (!id) {
      // id না থাকলে নতুন রিজিউম তৈরি করুন
      const newResume = createNewResume(true); // অসম্পূর্ণ রিজিউম
      savedResume = await newResume.save(); // নতুন রিজিউম সেভ করা হচ্ছে
    } else {
      // 2. যদি id থাকে, তবে targetResume চেক করুন
      const targetResume = await Resume.findOne({ _id: id });

      if (targetResume && targetResume.complete === false) {
        // যদি রিজিউমটি অসম্পূর্ণ (complete: false) হয়, তখন সেটি আপডেট করুন
        savedResume = await Resume.findByIdAndUpdate(
          id,
          {
            resumeName: personalInfo?.fullName || "Untitled Resume",
            personalInfo,
            education,
            experience,
            skills,
            interests,
            certifications,
            additionalSections,
            complete: true, // আপডেট করে সম্পূর্ণ হিসেবে চিহ্নিত করুন
          },
          { new: true, runValidators: true }
        );
      } else {
        // অন্যথায়, নতুন রিজিউম তৈরি করুন
        const newResume = createNewResume(true); // সম্পূর্ণ রিজিউম
        savedResume = await newResume.save(); // নতুন রিজিউম সেভ করা হচ্ছে
      }
    }

    // সাবস্ক্রিপশন আপডেট করো
    const subscription = await subscriptionModel.findOne({ userId });
    if (subscription && subscription.downloadsRemaining > 0) {
      subscription.downloadsRemaining -= 1;
      await subscription.save();
    }

    res.status(201).json(savedResume); // সফল হলে রিজিউমটি রিটার্ন করুন
  } catch (error) {
    res.status(500).json({ message: "Error saving resume", error: error.message });
  }
};



exports.getAllResumes = async (req, res) => {
  try {
    const { userId } = req.params;

    const resumes = await Resume.find({ userId, complete: true  });
    if (resumes.length === 0) {
      return res
        .status(404)
        .json({ message: "No resumes found for this user" });
    }

    res.setHeader("Content-Type", "application/json"); // Explicitly set the headeer
    res.status(200).json(resumes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching resumes", error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const deletedResume = await Resume.findByIdAndDelete(resumeId);
    if (!deletedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res
      .status(200)
      .json({ message: "Resume deleted successfully", deletedResume });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting resume", error: error.message });
  }
};

// Check if the user can generate a resume
// exports.checkResumeLimit = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     console.log("Checking resume limit for user:", userId);
//     // Find the user's subscription
//     const subscription = await subscriptionModel.findOne({ userId });

//     if (!subscription) {
//       return res.status(404).json({ message: "Subscription not found" });
//     }

//     const { resumeLimit, status } = subscription;

//     // Check if the subscription is active
//     if (status !== "active") {
//       return res.status(403).json({ message: "Subscription is not active" });
//     }

//     // Check the resume limit
//     if (resumeLimit === "unlimited") {
//       return res
//         .status(200)
//         .json({ message: "You can generate a resume", canGenerate: true });
//     } else if (resumeLimit === "0") {
//       return res.status(403).json({
//         message: "You have reached your resume generation limit",
//         canGenerate: false,
//       });
//     } else if (resumeLimit === "1") {
//       // Decrement the resume limit
//       subscription.resumeLimit = "0";
//       await subscription.save();
//       return res
//         .status(200)
//         .json({ message: "You can generate a resume", canGenerate: true });
//     } else {
//       return res
//         .status(403)
//         .json({ message: "Invalid resume limit", canGenerate: false });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// exports.checkResumeLimit = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     console.log("Checking resume limit for user:", userId);

//     // Find the user's subscription
//     const subscription = await subscriptionModel.findOne({ userId });

//     if (!subscription) {
//       return res.status(404).json({ message: "Subscription not found" });
//     }

//     const { planName, resumeLimit, status, downloadsRemaining } = subscription;

//     // Check if the subscription is active
//     if (status !== "active") {
//       return res.status(403).json({ message: "Subscription is not active" });
//     }

//     // Check if the user has downloads remaining
//     if (downloadsRemaining === 0) {
//       return res.status(403).json({
//         message: "You have reached your download limit",
//         canGenerate: false,
//       });
//     }

//     // Check the resume limit based on the plan
//     if (planName === "unlimited") {
//       return res
//         .status(200)
//         .json({ message: "You can generate a resume", canGenerate: true });
//     } else if (planName === "one-time") {
//       if (downloadsRemaining > 0) {
//         // Decrement the downloads remaining
//         subscription.downloadsRemaining -= 1;
//         await subscription.save();
//         return res.status(200).json({
//           message: "You can generate a resume",
//           canGenerate: true,
//           downloadsRemaining: subscription.downloadsRemaining, // Send remaining downloads to frontend
//         });
//       } else {
//         return res.status(403).json({
//           message: "You have reached your download limit",
//           canGenerate: false,
//         });
//       }
//     } else if (planName === "free") {
//       return res.status(403).json({
//         message: "Free plan does not allow downloads",
//         canGenerate: false,
//       });
//     } else {
//       return res
//         .status(403)
//         .json({ message: "Invalid subscription plan", canGenerate: false });
//     }
//   } catch (error) {
//     console.error(error);::::
//     res.status(500).json({ message: "Server error" });
//   }.........
// };

exports.checkResumeLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Checking resume limit for user:", userId);

    // Find the user's subscriptio
    const subscription = await subscriptionModel.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const { planName, resumeLimit, status, downloadsRemaining } = subscription;

    // Check if the subscription is active
    if (status !== "active") {
      return res.status(403).json({ message: "Subscription is not active" });
    }

    // Check if the user has downloads remaining
    if (downloadsRemaining === 0 && planName === "one-time") {
      return res.status(403).json({
        message: "You have reached your download limit",
        canGenerate: false,
      });
    }

    // Check the resume limit based on the plan
    if (planName === "unlimited") {
      return res
        .status(200)
        .json({ message: "You can generate a resume", canGenerate: true });
    } else if (planName === "one-time") {
      if (downloadsRemaining > 0) {
        // Decrement the downloads remaining
        // subscription.downloadsRemaining -= 1;
        // await subscription.save();
        return res.status(200).json({
          message: "You can generate a resume",
          canGenerate: true,
          downloadsRemaining: subscription.downloadsRemaining, // Send remaining downloads to frontend
        });
      } else {
        return res.status(403).json({
          message: "You have reached your download limit",
          canGenerate: false,
        });
      }
    } else if (planName === "free") {
      return res.status(403).json({
        message: "Free plan does not allow downloads",
        canGenerate: false,
      });
      //return res.status(200).json({ message: "You can generate a resume", canGenerate: true });
    } else {
      return res
        .status(403)
        .json({ message: "Invalid subscription plan", canGenerate: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
