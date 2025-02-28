const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminModel = new Schema({
    name: {
        type: String,
        required: true,
    },
    phno: {
        type: String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

});

module.exports = mongoose.model("admin", adminModel);