var express         = require('express');
var app             = express();
var http            = require('http').Server(app);
var mongoose        = require('mongoose');          // mongoose for mongodb
var morgan          = require('morgan');            // log requests to the console (express4)
var bodyParser      = require('body-parser');       // pull information from HTML POST (express4)
var methodOverride  = require('method-override');   // simulate DELETE and PUT (express4)

var io              = require('socket.io')(http);

mongoose.connect('mongodb://mtylpg:mtylpg@ds031903.mongolab.com:31903/shiplog');     // connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());


var Ship = mongoose.model('Ship', {
    icon: String,
    xPos: Number,
    yPos: Number,
    lastTurn: Number
});

app.get('/api/ships', function(req, res) {
    Ship.find(function(err, ships) {

        if (err)
            res.send(err)

        res.json(ships);
    });
});

app.post('/api/ships', function(req, res) {

    Ship.create({
        icon : 'icons/'+req.body.name+'.png',
        xPos : 100,
        yPos : 100
    }, function(err, ship) {
        if (err)
            res.send(err);
        Ship.find(function(err, ships) {
            if (err)
                res.send(err)
            res.json(ships);
        });
    });

});

app.put('/api/ships/:ship_id', function(req, res) {

    Ship.update(
    { _id : req.params.ship_id },
    {
        xPos : req.body.xPos,
        yPos : req.body.yPos
    },function(err, ship) {
        if (err)
            res.send(err);
        Ship.find(function(err, ships) {
            if (err)
                res.send(err)
            res.json(ships);
        });
    });

});

// delete a todo
app.delete('/api/ships/:ship_id', function(req, res) {

    Ship.remove({
        _id : req.params.ship_id
    }, function(err, ship) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Ship.find(function(err, ships) {
            if (err)
                res.send(err)
            res.json(ships);
        });
    });
});


// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

io.on('connection', function(socket){
  console.log('a user connected');
});

io.on('connection', function(socket){
  socket.on('shipmove', function(msg){
    console.log('ship move emited: ' + msg);
    io.emit('shipmove', msg);
  });
});

http.listen(8080);
console.log("App listening on port 8080");