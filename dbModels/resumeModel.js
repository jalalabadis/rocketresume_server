
const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for foreign key
      ref: "User", // Reference the User model
      required: true 
    },
    resumeName: { type: String, required: true },
    personalInfo: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      location: { type: String },
      portfolioUrl: { type: String },
      aboutMe: { type: String },
      additionalDetails: { type: String },
    },
    education: [
      {
        school: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        graduationYear: { type: String },
        description: { type: String },
        gpa: { type: String },
        honors: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String},
        position: { type: String },
        startDate: { type: String},
        endDate: { type: String},
        description: { type: String},
        achievements: [{ type: String }],
      },
    ],
    skills: [{ type: String }],
    interests: [{ type: String }],
    certifications: [{ type: String }],
    additionalSections: [
      {
        title: { type: String},
        content: { type: String},
      },
    ],
    complete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
