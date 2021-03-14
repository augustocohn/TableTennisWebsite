var http = require('http');
var express = require('express');
var mongoose = require("mongoose");

const { Announcement } = require("./schema/announcement");

var app = express();
app.set('port', 3000);

app.use(express.static('publi\
c'));

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
	console.log("MongoDB database connected");
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

function saveToJson(filePath, content) {
	log("Saving " + filePath);

	fs.writeFileSync(filePath, content);
}

const isLocalFileUpToDate = (filePath) => {
	if (fs.existsSync(filePath)) {
		//log(filePath + " exists.")
		var currentTime = new Date();
		var lastModified = getFileUpdatedDate(filePath);
		var timeDifference = Math.abs(currentTime.getTime() - lastModified.getTime());

		if (timeDifference < oneMinInMS) {
			return true;
		}
	}

	log(filePath + " is outdated or does not exist.");
	return false;
}

const getFileUpdatedDate = (path) => {
	const stats = fs.statSync(path);
	return stats.mtime;
}

app.post("/api/addannouncement", function(req, res) {
	log("addannouncement");
	try {
		Announcement.create({ title: req.body.title, body: req.body.body, date_created: Date.now() });

		return res.json({ message: "Successfully created announcement." });
	} catch (error) {
		return res.json({ message: error });
	}
});

app.put("/api/editannouncement", function(req, res) {
	log("editannouncement");
});

app.delete("/api/removeannouncement/:id", function(req, res) {
	log("removeannouncement");
	Announcement.findByIdAndDelete(req.query.id);
});

app.get("/api/getannouncements", function(req, res) {
	log("getannouncements");

	var limit = parseInt(req.query.count || 5);
	Announcement.find().sort({ _id: -1 }).limit(limit).exec(function(err, posts){
		if(err){
			console.log(err);
		}
		else{
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
