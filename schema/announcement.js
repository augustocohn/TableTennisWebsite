const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: false,
        required: true
    },
    body: {
        type: String,
        unique: false,
        required: true
    },
    date_created: {
        type: Number,
        unique: false,
        required: true
    },
    date_last_edited: {
        type: Number,
        unique: false,
        required: false
    }
});

const Announcement = mongoose.model("Announcement", AnnouncementSchema);

module.exports = { Announcement };