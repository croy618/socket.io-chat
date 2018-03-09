//Charlie Roy, March 8th, 2018
//SENG 513 Winter 2018, A3

const app = require('express')();
const cookieParser = require('cookie-parser');
const http = require('http').Server(app);
//const io = require('socket.io')(http);
const io = require('socket.io')(http, { wsEngine: 'ws' }); //This engine doesn't have the same issues as uWS on Windows. See Socket.io issue #3100.
const randomColor = require('random-color');
const moment = require('moment');
const nicknames = require('epithet');

app.use(cookieParser ());

let messages = [];
let users = [];

//Routes
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function(req, res){
    res.sendFile(__dirname + '/style.css');
})

//Socket connection
io.on('connection', function(socket){

    function indexUser(string) {
        for (let i=0; i < users.length; i++) {
            if (users[i].name === string) {
                return i;
            }
        }
        return -1;
    }

    function removeUser(string) {
        for (let i=0; i < users.length; i++) {
            if (users[i].name === string) {
                users.splice(i, 1);
                break;
            }
        }
    }

    var tempName
      , tempColor;
    if (socket.handshake.headers.cookie && socket.handshake.headers.cookie.indexOf('user=') !== -1) {
        var parts = socket.handshake.headers.cookie.split("user=")[1].split(";")[0].split(":");
        tempName = parts[0];
        tempColor = parts[1];
    } else {
        var tempName = nicknames.choose();
        var tempColor = randomColor().hexString();
    }

    var user = {
        name: tempName,
        color: tempColor,
        sessions: 1
    }

    let duplicate = false;
    for (i in users) {
        if (users[i].name === user.name) {
            duplicate = true;
            users[i].sessions++;
        }
    }
    if (!duplicate) {
        users.push(user);
    }
    io.to(socket.id).emit('youAre', user); //Assign identity
    io.emit('updateUsers', users);  //Update the user lists
    io.to(socket.id).emit('history', messages); //Send the history to the new user
    io.to(socket.id).emit('system message', "You are: "+user.name); //System chat about new user
    socket.broadcast.emit('system message', user.name+" has joined");

    socket.on('disconnect', function(){
        users[indexUser(user.name)].sessions--;
        if (users[indexUser(user.name)].sessions <= 0) {
            removeUser(user.name);
            socket.broadcast.emit('system message', user.name+" has left");
            io.emit('updateUsers', users);
        }
    });
    socket.on('chat message', function(msg){
        if (msg.length >= 6 && msg.slice(0,6) === "\\nick ") {
            let name = msg.slice(6);
            let index = indexUser(name);
            if (index !== -1) {
                io.to(socket.id).emit('system message', "The name "+name+" is already taken.");
            } else {
                let current = indexUser(user.name);
                user.name = name;
                users.splice(current, 1, user);
                io.to(socket.id).emit('system message', "Name changed to "+user.name);
            }
            io.to(socket.id).emit('youAre', user);
            io.emit('updateUsers', users);
        } else if (msg.length >= 11 && msg.slice(0,11) === "\\nickcolor ") {
            let color = msg.slice(11);
            if (/^[0-9a-fA-F]{6}$/.test(color)){
                let current = indexUser(user.name);
                user.color = "#"+color;
                users.splice(current, 1, user);
                io.to(socket.id).emit('system message', "Nickname color changed to #"+color);
                io.to(socket.id).emit('youAre', user);
                io.emit('updateUsers', users);
            } else {
                io.to(socket.id).emit('system message', "Invalid color, usage: \'\\nickcolor XXXXXX\'");
            }
        } else {
            var time = moment().format("HH:mm");
            let message = {
                timestamp: time,
                origin: user,
                body: msg
            }
            if (messages.length === 200) {
                messages.shift();
            }
            messages.push(message);
            io.emit('chat message', message);
        }
    });
});

//Start server
http.listen(3000, function(){
  console.log('listening on port:3000');
});
