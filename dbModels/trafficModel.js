const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trafficModel = new Schema({
    ip: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
   time : {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model("Traffic", trafficModel);
