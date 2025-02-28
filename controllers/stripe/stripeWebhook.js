const stripe = require("stripe")("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"); // Initialize Stripe with your secret key
const subscriptionModel = require("../../dbModels/subscriptionModel");

exports.stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = "whsec_y9qVMraSDuTWRLFG0SVg0dmCJfXrYaUO";
  let event;



  try {
    // Verify the webhook event
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
 
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      // Extract metadata
      const userId = session.metadata.userId;
      const planName = session.metadata.planName;
      console.log(`User ${userId} subscribed to plan ${planName}`);

      const resumeLimit = planName === "one-time" ? "1" : "unlimited";
      const downloadsRemaining = 1;

      try {
        // Update or create subscription
        const sub = await subscriptionModel.findOneAndUpdate(
          { userId: userId },
          {
            $set: {
              planName,
              resumeLimit,
              status: "active",
              downloadsRemaining
            },
          },
          { upsert: true, new: true }
        );

   
      } catch (err) {
        console.error("Error updating subscription:", err);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};