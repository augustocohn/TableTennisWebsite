const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
	username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        unique: false,
        required: true
    }
});

const User = mongoose.model('db', loginSchema, 'db');

module.exports = { User };