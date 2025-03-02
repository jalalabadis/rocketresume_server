const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ipModel = new Schema({
    ip: {
        type: String,
        required: true,
    },
    active: {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model("IpUser", ipModel);
