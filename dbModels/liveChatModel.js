const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const liveChatModel = new Schema({
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status:{
        type: Boolean,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model("LiveChat", liveChatModel);
