var express    = require('express'),
	sys        = require('sys'),
	spawn      = require('child_process').spawn,
	fs		   = require('fs'),
	winston    = require('winston');

var app     = express();

var info = new function(){
	this.logger = new winston.Logger ({
		transports: [
			new winston.transports.Console(),
			new winston.transports.File({filename: 'log'})
		]
	});
	this.log = function(str){
		return this.logger.log('info', str);
	};
};

fs.open('pid.txt', 'w', function(err, fd){
	info.log("App started with pid: " + process.pid);
	fs.write(fd, process.pid);
});

process.on('SIGINT', function() {
	info.log('Got SIGINT.  Bye!');
	fs.unlink('pid.txt', function(){
		info.log('[unlinked PID file]');
		process.exit();
	});
});

app.get('/deploy', function(req, res){
	info.log("Got order to deploy, fingers crossed!");
	res.send();
	var child = spawn("./deploy.sh", [], {detached: true, stdio:['ignore', 'ignore', 'ignore']});
});

app.get('/', function(req, res){
	res.send('/');
});

app.listen(8888);