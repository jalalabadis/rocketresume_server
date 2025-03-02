const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../dbModels/userModel");
const LiveChat = require("../dbModels/liveChatModel");
const Traffic = require("../dbModels/trafficModel");
const Subscription = require("../dbModels/subscriptionModel");


//////Start Chat
router.post('/start', async (req, res) => {
  try {
    const {email, message} = req.body;
    if(!email&&!message){
      return res.status(400).json({ Status: false, Message: "Invalid count value" });
    }

      await LiveChat.create({
        email: email,
       message: message,
       status:false,
       time: Date.now()
      });

      res.status(200).json({ Status: true});
  } catch (err) {
    console.log(err);
    res.status(500).json({Status: false, Message:'Internal Server Error'});
  }
}); 


//////Mark message
router.post('/mark', async (req, res) => {
  try {
    const {_id} = req.body;
    if (!_id) {
      return res.status(400).json({ Status: false, Message: "Invalid count value" });
    }
    const targetChat = await LiveChat.findOne({ _id });
    if(!targetChat){
      return res.status(400).json({ Status: false, Message: "No Record" });
     }

     await targetChat.updateOne({ $set: { status: true } });

      res.status(200).json({ Status: true, Message: "Chat update successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({Status: false, Message:'Internal Server Error'});
  }
});



//////All chat
router.post('/all', async (req, res) => {
    try {
        const chatAll = await LiveChat.find().sort({ time: -1 });
        res.status(200).json(chatAll);
       
    } catch (err) {
      console.log(err);
      res.status(200).json({Status: false, Message:'Internal Server Error'});
    }
  });


  



// Export router
module.exports = router;