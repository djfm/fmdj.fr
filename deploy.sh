#!/bin/bash

PID=$(<pid.txt)
kill -s SIGINT $PID

while [ -f "pid.txt" ]; do
	echo "Waiting for process $PID..."
	sleep 1
done

echo "Seems gone! Pulling!"

git pull

echo "...and starting up again!"

node app.js