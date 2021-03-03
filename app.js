var http = require('http');
var express = require('express');


var app = express();
app.set('port', 3000);

app.use(express.static('public'));

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
