const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../dbModels/userModel");
const IpModel = require("../dbModels/ipModel");
const Traffic = require("../dbModels/trafficModel");
const Subscription = require("../dbModels/subscriptionModel");


//////Start Page Visit
router.post('/start', async (req, res) => {
  try {
    const {url} = req.body;
    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : '103.71.47.193';
    const ipUser = await IpModel.findOne({ ip: clientIp });
    if(!ipUser){
       await IpModel.create({
        ip: clientIp,
        active: Date.now()
      })}
      await ipUser.updateOne({ $set: { active: Date.now() } });
    const pageTraffic =  await Traffic.create({
        ip: clientIp,
        url: url,
      count: 1,
      time: Date.now()
      });

      res.status(200).json({ Status: true, pageTrafficID: pageTraffic._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({Status: false, Message:'Internal Server Error'});
  }
}); 


//////End Page Visit
router.post('/end', async (req, res) => {
  try {
    const {pageTrafficID, count} = req.body;
    if (!count || typeof count !== "number" || count < 0) {
      console.log(count, pageTrafficID)
      return res.status(400).json({ Status: false, Message: "Invalid count value" });
    }
    const pageTraffic = await Traffic.findOne({ _id: pageTrafficID });
    if(!pageTraffic){
      console.log("er")
      return res.status(400).json({ Status: false, Message: "No Record" });
     }

     await pageTraffic.updateOne({ $set: { count } });

      res.status(200).json({ Status: true, Message: "Traffic update successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({Status: false, Message:'Internal Server Error'});
  }
});



//////All Ip User
router.post('/all-ip', async (req, res) => {
    try {
        const ipUser = await IpModel.find();
        res.status(200).json(ipUser);
       
    } catch (err) {
      console.log(err);
      res.status(200).json({Status: false, Message:'Internal Server Error'});
    }
  });

  router.post('/analysis', async (req, res) => {
    try {
      //await Traffic.deleteMany({});
      const { ip } = req.body;
      const traffic = await Traffic.find({ ip }); // ✅ findAll() -> find()
      
      res.status(200).json(traffic);
    } catch (err) {
      console.log(err);
      res.status(500).json({ Status: false, Message: 'Internal Server Error' }); // ✅ 500 ব্যবহার করুন
    }
  });
  



// Export router
module.exports = router;