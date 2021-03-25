var http = require('http');
var express = require('express');
var mongoose = require("mongoose");
var fs = require('fs');
var session = require("express-session");
const { Announcement } = require("./schema/announcement");
const { User } = require("./schema/logins");


var app = express();

//server port can be set via the PORT environment virable
//if no environment variable is set, default port will be 3000
app.set('port', process.env.PORT || 3000);

//set static folder to public
//all webfiles in this folder will be publicly accessible from the server
app.use(express.static('public'));

//express middleware used for parsing req and body objects
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//mongodb url used for testing, to be cleared before committing 
const DB_URI = "mongodb+srv://dbAdmin:dbPassword@cluster0.iycaa.mongodb.net/tableTennis?authSource=admin&replicaSet=atlas-s8qatg-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";

//connect to db
//mongodb url needs to be passed through the DB_URI environment variable
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
//allows other websites to access information on this site
//likely unneeded and might be removed in future
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//function used for logging activities to the console
//displays in 'HH:MM:SS:MS - $msg' format
function log(msg) {
	var time = new Date();
	console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "." + time.getMilliseconds() + " - " + msg);
}

//allows the html to access things like css
app.use(express.static('../../var/www/html'));

//load HTML files
app.get('/', function(req, res){
	fs.readFile('./public/index.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});
app.get('/about', function(req, res){
	fs.readFile('./public/about.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});
app.get('/admin', function(req, res){
	if(req.session.admin){
		fs.readFile('./public/adminpanel.html', function (err, html) {
			if (err || !req.session.admin) {
				res.writeHead(404);
				res.write('File not found!');
				res.end();
				return;
			}
				res.writeHeader(200, {"Content-Type": "text/html"});  
				res.write(html);  
				res.end();
		});
	}else{
		fs.readFile('./public/admin.html', function (err, html) {
			if (err) {
				res.writeHead(404);
				res.write('File not found!');
			}
				res.writeHeader(200, {"Content-Type": "text/html"});  
				res.write(html);  
				res.end();
		});
	}
});
app.get('/contact', function(req, res){
	fs.readFile('./public/contact.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});
app.get('/faq', function(req, res){
	fs.readFile('./public/faq.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});
app.get('/shop', function(req, res){
	fs.readFile('./public/shop.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});
app.get('/tournament', function(req, res){
	fs.readFile('./public/tournament.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});
app.get('/photos', function(req, res){
	fs.readFile('./public/photos.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
	});
});



//route used for adding announcement to the db
//will return status in json 'message' field
//required variables:
//	title:	the title of the announcement
//	body:	the body content of the announcement post
app.post("/api/addannouncement", function (req, res) {
	if(!req.session.admin){
		return res.json({ message: "Error: User unauthorized"})
	}
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

//route used for editing existing announcements in the db
//will return status in json 'message' field
//required variables:
//	id:		the id of the announcement to be updated
//	title:	the new title of the announcement
//	body:	the new body content of the announcement post
app.post("/api/editannouncement", function (req, res) {
	if(!req.session.admin){
		return res.json({ message: "Error: User unauthorized"})
	}
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
			res.redirect("/admin");
			return res.json({ message: "Successfully updated announcement." });
		}
	});
});

//route used for removing existing announcement from the db
//will return status in json 'message' field
//required variables:
//	id:		the id of the announcement to be removed
app.post("/api/removeannouncement", function (req, res) {
	if(!req.session.admin){
		return res.json({ message: "Error: User unauthorized"})
	}
	Announcement.findByIdAndDelete({ _id: req.body.id }, {}, function (err, announcement) {
		if (err) {
			log("Failed to delete announcement id: " + req.body.id);
			return res.json({ message: "Error: Failed to delete announcement: " + err });
		} else {
			res.redirect("/admin");
			return res.json({ message: "Successfully deleted announcement." });
		}
	});
});

//route used for retrieving recent $count announcements from the db
//if no count variable is passed, it will return the most recent 5 by default
//returns json
//optional variables:
//	count:	the number of recent announcement posts to retrieve
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

//User authentication

app.post("/login", (req,res) => {
	User.findOne({username:req.body.uname, password:req.body.psw}, function(err,user){
		if(err || !user){
			return res.json({ message: "User does not exist or an error has occured.", uname: req.body.uname, password: req.body.psw });
		}
		req.session.admin = true;
		res.redirect("/admin");
	}
)});

//route used for 404, page/file not found errors
app.use(function (req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

//route used for 500, generic errors
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.type('plain/text');
	res.status(500);
	res.send('500 - Server Error');
});

//start the server
app.listen(app.get('port'), function () {
	log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

