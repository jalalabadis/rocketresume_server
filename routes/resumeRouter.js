const express = require("express");
const { saveResume, createDraftResume, updateResume, getDraftResume, getAllResumes, deleteResume, checkResumeLimit } = require("../controllers/resumeController");
// const {
//   createDraftResume,
//   updateResume,
//   getDraftResume,
//   getSavedResume,
// } = require("../Controllers/resumeController");
const resumeRouter = express();
resumeRouter.post("/draft", createDraftResume);

// // Endpoint to update the resume (after registration and for Steps 4–6)
// // Make sure you secure this endpoint as needed (e.g., with authentication middleware).
resumeRouter.put("/:id", updateResume);
resumeRouter.get("/getdraft", getDraftResume);
// resumeRouter.get("/getsaved", getSavedResume);

resumeRouter
resumeRouter.post("/save", saveResume);

// Get all resumes for a user
resumeRouter.get("/getallresumes/:userId", getAllResumes);

// Delete a resume by ID
resumeRouter.delete("/delete/:resumeId", deleteResume);

resumeRouter.get("/check-resume-limit/:userId", checkResumeLimit);
module.exports = resumeRouter;
