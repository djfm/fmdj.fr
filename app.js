/*********
* CONFIG *
**********/

var allowed_to_deploy = ['204.232.175.64/27', '192.30.252.0/22'];


/*********
*  CODE  *
**********/

var express    = require('express'),
	sys        = require('sys'),
	spawn      = require('child_process').spawn,
	fs		   = require('fs'),
	winston    = require('winston'),
	ip		   = require('./ip.js');

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

app.post('/deploy', function(req, res){

	var from_ip = req.headers['x-forwarded-for'].split(',')[0].trim();

	var ok = false;
	for(var i in allowed_to_deploy)
	{
		if(ip.inSubNet(from_ip, allowed_to_deploy[i]))
		{
			ok=true;
			break;
		}
	}

	if(ok)
	{
		info.log("Got order to deploy, fingers crossed!");
		res.send();
		var child = spawn("./deploy.sh", [], {detached: true, stdio:['ignore', 'ignore', 'ignore']});
	}
	else
	{
		info.log("Cannot deploy from " + from_ip);
	}

	
});

app.get('/', function(req, res){
	res.send(req.hostname);
});

app.listen(8888);