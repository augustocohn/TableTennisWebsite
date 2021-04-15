const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
    players: [{fullname: String, wins : Number}],
    date: {
        type: Number,
        required: false
    },
    roundcount: {
        type: Number,
        required: false
    }
});

const Tournament = mongoose.model("tournament", TournamentSchema, "tournament");

module.exports = { Tournament };