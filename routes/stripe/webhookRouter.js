const express = require("express");
const { stripeWebhookHandler } = require("../../controllers/stripe/stripeWebhook");

const webHookRouter = express.Router();

// Stripe webhook route
webHookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Ensure the body is raw for Stripe signature verification
  stripeWebhookHandler
);




module.exports = webHookRouter;