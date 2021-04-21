var http = require('http');
var express = require('express');
var mongoose = require("mongoose");
var fs = require('fs');
var session = require("express-session");
var multer = require('multer');
const { Announcement } = require("./schema/announcement");
const { User } = require("./schema/logins");
const { Tournament } = require("./schema/tournament");



var app = express();

var upload = multer({ dest: './public/' });

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
	rolling: true,
	saveUninitialized: true
}));

//mongodb url used for testing, to be cleared before committing 
const DB_URI = "";

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
app.use(express.static('public'));

//load HTML files
app.get('/', function (req, res) {
	fs.readFile('./public/index.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
		res.write(html);
		res.end();
	});
});
app.get('/about', function (req, res) {
	fs.readFile('./public/about.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
		res.write(html);
		res.end();
	});
});
app.get('/admin', function (req, res) {
	if (req.session.admin) {
		fs.readFile('./public/adminpanel.html', function (err, html) {
			if (err || !req.session.admin) {
				res.writeHead(404);
				res.write('File not found!');
				res.end();
				return;
			}
			res.writeHeader(200, { "Content-Type": "text/html" });
			res.write(html);
			res.end();
		});
	} else {
		fs.readFile('./public/admin.html', function (err, html) {
			if (err) {
				res.writeHead(404);
				res.write('File not found!');
			}
			res.writeHeader(200, { "Content-Type": "text/html" });
			res.write(html);
			res.end();
		});
	}
});
app.get('/contact', function (req, res) {
	fs.readFile('./public/contact.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
		res.write(html);
		res.end();
	});
});
app.get('/faq', function (req, res) {
	fs.readFile('./public/faq.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
		res.write(html);
		res.end();
	});
});
app.get('/shop', function (req, res) {
	fs.readFile('./public/shop.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
		res.write(html);
		res.end();
	});
});
app.get('/tournament', function (req, res) {
	Tournament.findOne().sort({ date_created: -1 }).exec(function (err, posts) {
		if (!posts || posts.active || posts.completed) {
			fs.readFile('./public/tournament.html', function (err, html) {
				if (err) {
					res.writeHead(404);
					res.write('File not found!');
				}
				res.writeHeader(200, { "Content-Type": "text/html" });
				res.write(html);
				res.end();
			});
		}
		else {
			fs.readFile('./public/signups.html', function (err, html) {
				if (err) {
					res.writeHead(404);
					res.write('File not found!');
				}
				res.writeHeader(200, { "Content-Type": "text/html" });
				res.write(html);
				res.end();
			});
		}
	})
});



app.get("/api/getphotos", function (req, res) {
	let data = []
	const testFolder = './public/images/photos';
	fs.readdirSync(testFolder).forEach(file => {
		data.push("/images/photos/" + file)
	});

	return res.send(data);
	
});

app.get('/photos', function (req, res) {
	fs.readFile('./public/photos.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
		res.write(html);
		res.end();
	});
});

app.get('/history', function (req, res) {
	fs.readFile('./public/tournamenthistory.html', function (err, html) {
		if (err) {
			res.writeHead(404);
			res.write('File not found!');
		}
		res.writeHeader(200, { "Content-Type": "text/html" });
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
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	try {
		Announcement.create({
			title: req.body.title,
			body: req.body.body,
			date_created: Date.now()
		});
		res.redirect("/admin");
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
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	} else {
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
			}
		});
	}
});

//route used for removing existing announcement from the db
//will return status in json 'message' field
//required variables:
//	id:		the id of the announcement to be removed
app.post("/api/removeannouncement", function (req, res) {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	} else {
		Announcement.findByIdAndDelete({ _id: req.body.id }, {}, function (err, announcement) {
			if (err) {
				log("Failed to delete announcement id: " + req.body.id);
				return res.json({ message: "Error: Failed to delete announcement: " + err });
			} else {
				res.redirect("/admin");
			}
		});
	}
});

//route used for retrieving recent $count announcements from the db
//if no count variable is passed, it will return the most recent 5 by default
//returns json
//optional variables:
//	count:	the number of recent announcement posts to retrieve
app.get("/api/getannouncements", function (req, res) {
	var limit = parseInt(req.query.count || 5);
	Announcement.find().sort({ date_created: -1 }).limit(limit).exec(function (err, posts) {
		if (err) {
			console.log(err);
		}
		else {
			return res.send(posts);
		}
	});
});

//route used to authenticate and login an admin
//will return status in json 'message' field on failure and direct on success
//required variables:
//	uname:	the username of the user
//	psw: 	the password of the user
app.post("/login", (req, res) => {
	User.findOne({ username: req.body.uname, password: req.body.psw }, function (err, user) {
		if (err || !user) {
			return res.json({ message: "User does not exist or an error has occured.", uname: req.body.uname, password: req.body.psw });
		}
		req.session.admin = true;
		res.redirect("/admin");
	});
});

//route used to upload photos
//will place the photos in ./public/images/photos/
//required variables:
//	file:	the image to upload and store
app.post('/api/uploadphoto', upload.single('file'), function (req, res) {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	var file = __dirname + '/public/images/photos/' + req.file.originalname;
	fs.rename(req.file.path, file, function (err) {
		if (err) {
			log(err);
			res.send(500);
		} else {
			res.redirect("/admin");
		}
	});
});

//route used for adding future tournament to the db
//will return status in json 'message' field
//required variables:
//	date:	the date when the tournament will take place
//	time:	the time when the tournament will take pace
app.post("/api/addtournament", (req, res) => {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	try {
		Tournament.create({
			date: new Date(req.body.date + "T" + req.body.time).getTime(),
			date_created: Date.now(),
			roundcount: 0,
			active: false,
			completed: false
		});
		log("Successfully created new tournament");
		res.redirect("/admin");
	} catch (error) {
		return res.json({ message: "Failed to create tournament." });
	}
});

// Generates roundrobin brackets for the tournament passed in
function generateTournamentMatches(id) {
	Tournament.findById(id, function (err, tournament) {
		var players = tournament.players.map(each => each.fullname);

		if (players.length % 2 == 1) {
			players.push("BYE");
		}

		const player_count = players.length;
		const round_count = player_count - 1;

		const pairings = [];

		const player_indexes = players.map((_, i) => i).slice(1);

		for (let round = 0; round < round_count; round++) {
			const round_pairings = [];

			//concat with an empty array to copy the values
			const new_player_indexes = [0].concat(player_indexes);

			for (let i = 0; i < player_count / 2; i++) {
				round_pairings.push({
					playerone: players[new_player_indexes[i]],
					playertwo: players[new_player_indexes[player_count - 1 - i]],
					winner: 0
				});
			}

			//rotating the array
			player_indexes.push(player_indexes.shift());
			pairings.push(round_pairings);
		}

		Tournament.findByIdAndUpdate({ _id: id }, {
			matches: pairings
		}, { safe: true, multi: true }, function (err, obj) {
			if (err) {
				log("Error generating matches for tournament " + id);
			} else {
				log("Successfully generated matches for tournament " + id);
			}
		});
	});

}

//route used for starting a tournament
//will redirect to admin page upon success
//required variables:
//	id:		id of the tournament to start
app.post("/api/starttournament", (req, res) => {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	Tournament.findByIdAndUpdate({ _id: req.body.id }, {
		active: true
	}, { safe: true, multi: true }, function (err, obj) {
		if (err) {
			log("Error starting tournament " + req.body.id);
		} else {
			generateTournamentMatches(req.body.id);
			log("Successfully started tournament " + req.body.id);
		}
	});

	res.redirect('back');
});

//route used for ending a tournament
//will redirect to admin page upon success
//required variables:
//	id:		id of the tournament to end
app.post("/api/endtournament", (req, res) => {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	Tournament.findByIdAndUpdate({ _id: req.body.id }, {
		active: false,
		completed: true
	}, { safe: true, multi: true }, function (err, obj) {
		if (err) {
			log("Error ending tournament " + req.body.id);
		} else {
			log("Successfully ended tournament " + req.body.id);
		}
	});

	res.redirect('back');
});

//route used for advancing a tournament to the next round
//and setting the winners for each round
//will reload page
//required variables:
//	id:		id of the tournament to advance
//	result:	array of values corresponding to the winner of each round
//			ex. a round with 3 matches would send [1, 2, 1] (1st player won, 2nd player won, 1st player won)
app.post("/api/advancetournament", (req, res) => {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	var result = req.body.result.map(Number);

	Tournament.findById(req.body.id).then(doc => {
		var rounds = doc.matches[doc.roundcount];
		var players = doc.players;
		for (let i = 0; i < rounds.length; i++) {
			rounds[i].winner = result[i];

			if (result[i] == 1) {
				let player = players.find(player => player.fullname == rounds[i].playerone);
				player.wins += 1;
			}
			else if (result[i] == 2) {
				let player = players.find(player => player.fullname == rounds[i].playertwo);
				player.wins += 1;
			}
		}

		doc.roundcount += 1;

		doc.save();
	});

	res.redirect('back');
});

//route used for adding players to a future tournament
//will redirect to tournament page upon success
//required variables:
//	id:			id of the tournament to add players to
//	fullname:	full name of the player to be added to the tournament
app.post("/api/addplayer", (req, res) => {
	Tournament.findByIdAndUpdate({ _id: req.body.id }, {
		"$push": { players: { fullname: req.body.fullname, wins: 0 } }
	}).exec();
	res.redirect("/tournament");
});


//route used for removing players from a future tournament
//will redirect to admin page upon success
//required variables:
//	id:			id of the tournament to remove players from
//	fullname:	full name of the player to be removed to the tournament
app.post("/api/removeplayer", (req, res) => {
	if (!req.session.admin) {
		return res.json({ message: "Error: User unauthorized" })
	}
	Tournament.findByIdAndUpdate({ _id: req.body.id }, {
		"$pull": { "players": { "fullname": req.body.fullname } }
	}, { safe: true, multi: true }, function (err, obj) {
		if (err) {
			log("Error removing player " + req.body.fullname + " from tournament " + req.body.id);
		} else {
			log("Successfully removed player " + req.body.fullname + " from tournament " + req.body.id);
		}
	});
	res.redirect("/admin");
});

//route used for retrieving tournaments from the db
//returns json
app.get("/api/gettournaments", function (req, res) {
	Tournament.find().sort({ date_created: -1 }).exec(function (err, posts) {
		if (err) {
			console.log(err);
		}
		else {
			return res.send(posts);
		}
	})
});

//route used for retrieving a specific tournament by id
//returns json
//required variables:
//	id:		id of the tournament to retrieve
app.post("/api/gettournament", function (req, res) {
	Tournament.findById({ _id: req.body.id }).exec(function (err, posts) {
		if (err) {
			console.log(err);
		}
		else {
			return res.send(posts);
		}
	})
});

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