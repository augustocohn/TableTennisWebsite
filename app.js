var http = require('http');
var express = require('express');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const { Announcement } = require("./schema/announcement");

var app = express();
app.set('port', 3000);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//under normal circumstances, store this in a git-ignored config file or environment variable
const DB_URI = "";

//connect to db
mongoose.connect(process.env.DB_URI || DB_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once("open", () => {
	log("MongoDB database connected");
});
connection.on("error", (error) => console.log("Error: " + error));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

function log(msg) {
	var time = new Date();
	console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "." + time.getMilliseconds() + " - " + msg);
}

app.post("/api/addannouncement", function (req, res) {
	try {
		Announcement.create({
			title: req.body.title,
			body: req.body.body,
			date_created: Date.now()
		});

		return res.json({ message: "Successfully created announcement." });
	} catch (error) {
		return res.json({ message: "Failed to create annoucement." });
	}
});

app.post("/api/editannouncement", function (req, res) {
	if (req.body.id === undefined)
		return res.json({ message: "Error: Missing ID." });

	Announcement.findByIdAndUpdate({ _id: req.body.id }, {
		title: req.body.title,
		body: req.body.body,
		date_last_edited: Date.now()
	}, {
		new: true
	}, function (err, model) {
		if (err) {
			log("Failed to update announcement id: " + req.body.id);
			return res.json({ message: "Error: Failed to update announcement: " + err });
		} else {
			return res.json({ message: "Successfully updated announcement." });
		}
	});
});

app.post("/api/removeannouncement", function (req, res) {
	Announcement.findByIdAndDelete({ _id: req.body.id }, {}, function (err, announcement) {
		if (err) {
			log("Failed to delete announcement id: " + req.body.id);
			return res.json({ message: "Error: Failed to delete announcement: " + err });
		} else {
			return res.json({ message: "Successfully deleted announcement." });
		}
	});
});

app.get("/api/getannouncements", function (req, res) {
	var limit = parseInt(req.query.count || 5);

	Announcement.find().sort({ _id: -1 }).limit(limit).exec(function (err, posts) {
		if (err) {
			console.log(err);
		}
		else {
			return res.send(posts);
		}
	});
});

app.use(function (req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.type('plain/text');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {
	log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
