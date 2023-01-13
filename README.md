# Jeketi Server
Manages the scheduling of scraper, informs to line bot server if schedule changes
written using nodejs

## Setup
clone this repo with ```git clone https://github.com/f4devcircle/jeketi-server.git```
rename the .env.template with .env and fill it in

## Installation
dockerfile is included, if you have docker, you can build right away, or if you want to preserve those dolphins and let them free, you can also not use docker

### Without docker
make sure nodejs is installed, then you can just type ```npm install``` and nodejs will take care all of them for you

### With docker
make sure docker is installed, then you can run the build command with ```docker build <desired image name> .``` **Don't forget the '.' in the end of command**
wait for it until it's done, then you can run using ```sudo docker run -d -p 3000:3000```

**-d is detached, means it will run in the background -p \<hostPort\>:\<instancePort\>** is to map instance to the host