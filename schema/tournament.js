const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
    players: [{fullname: String, wins: Number}],
    matches: [[{playerone: String, playertwo: String, winner: Number}]],
    date: {
        type: Number,
        required: true
    },
    roundcount: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
});

const Tournament = mongoose.model("tournament", TournamentSchema, "tournament");

module.exports = { Tournament };