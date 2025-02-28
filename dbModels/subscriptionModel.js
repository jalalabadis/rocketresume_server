const mongoose = require("mongoose");
const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      enum: ["free", "one-time", "unlimited"],
      required: true,
    },
    resumeLimit: {
      type: String,
      enum: ["0", "1", "unlimited"],
      default: "0",
    },
    stripeSubscriptionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    downloadsRemaining: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
