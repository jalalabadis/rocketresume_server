const express = require("express");
const Striperouter = express.Router();
const stripe = require("stripe")(
  "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"
); 

Striperouter.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId, userId, planName } = req.body;


    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment", // or 'payment' for one-time
      success_url: `${
        process.env.APP_DEEP_LINK || "https://www.rocketresume.app"
      }/success`,
      cancel_url: `${
        process.env.APP_DEEP_LINK || "https://www.rocketresume.app"
      }/cancel`,
      metadata: {
        userId: userId.toString(),
        planName: planName.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = Striperouter;


