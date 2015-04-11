var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var ObjectID = require("mongodb").ObjectID;

var port = 3000;
server.listen(port);
var databaseUrl = "radios";

var usuariosOnline = new Array();
console.log('Start Web Services NodeJS in Port ' + port);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Path de los CSS que utilizarán para el estilo de la página
app.use("/css", express.static(__dirname + '/css'));
app.use("/fonts", express.static(__dirname + '/fonts'));
//Path de funciones en Javascript que podrían utilizar
app.use("/function", express.static(__dirname + '/function'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/img", express.static(__dirname + '/img'));
//Routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/view/app.html');
});


app.post('/send', function(req, res){
	console.log('Send Post');
	res.sendfile(__dirname + "/view/index.html");
});
app.post('/agregar', function(req, res){

	res.sendfile(__dirname + "/view/add.html");
});

app.post('/modificar', function(req, res){

	res.sendfile(__dirname + "/view/update.html");
});

app.post('/eliminar', function(req, res){

	res.sendfile(__dirname + "/view/delete.html");
});

app.post('/addtoDB', function(req, res){
	  var post_data = req.body;
	
	  var nombre = post_data["radio[nombre]"];
	  var ip = post_data["radio[ip]"];
	  var numPar= post_data["radio[numPar]"]; 
	  var collec = ['radios'];
	  var db = require("mongojs").connect(databaseUrl, collec);
	  var collection = db.collection('radios');
	  db.radios.save({nombre: nombre, dirección: ip, maxUsers: numPar, actualUser: '0' }, function(err, saved) {
		  if( err || !saved ) console.log("No se ha podido guardar la radio");
		  else console.log("Radio guardada con éxito");
		});
	   res.sendfile('/');

});
app.post('/deleteToDB', function(req, res){
	var post_data = req.body;
	var id = post_data["seleccion"];
	var collec = ['radios'];
	var db = require("mongojs").connect(databaseUrl, collec);
	var collection = db.collection('radios');
	db.radios.remove({_id : ObjectID(id)}, {safe: true},function(err, removed){
	        if( err || !removed ) console.log("No se ha podido guardar la radio");
		  	else console.log("Radio eliminada con éxito");
	   		 });
	
	 res.redirect('/');
});
//server.listen("8000", "127.0.0.1"); 
//console.log('Server running at http://127.0.0.1:8000'); 

io.sockets.on('connection', function (socket) { // conexion
	
	var collec = ['radios'];
	var db = require("mongojs").connect(databaseUrl, collec);
	var collection = db.collection('radios');
	db.radios.find(function(err, docs) {
	// docs is an array of all the documents in mycollection
		for (var i = 0; i < docs.length; i++) {
			socket.emit('cargarRadios', docs[i]);
			//

		};

	});		
	socket.on('initRoom', function (data) {
		console.log("Entro al chat");
		socket.join();
	});

	/*socket.on('agregar', function (data) {
		
	});*/

	socket.on('disconnect', function () {
		
		if(socket.username) {
			console.log("Usuario desconectado " + socket.username);
			socket.leave();
			var messaje = socket.username+ " ha salido a la sala de chat.";
			var byeUser = usuariosOnline.indexOf(socket.username);
			byeUser > -1 && usuariosOnline.splice( byeUser, 1 );

			socket.broadcast.emit('salidaUsuario', { text:messaje});
			socket.broadcast.emit('updateUsers', usuariosOnline);
		}
		else socket.leave();
		
	});
		
	socket.on('ingresoUser', function (data) {
		socket.username = data.text;
		usuariosOnline.push(data.text);
		console.log("Ingreso el usuario: " + data.text);
		var messaje = data.text+ " ha ingresado a la sala de chat.";
		socket.broadcast.emit('ingresoUsuario', { text:messaje});
		socket.broadcast.emit('updateUsers', usuariosOnline);
	});

	socket.on('ingresoSala', function (data) {
	
		socket.emit('enterRoom', { text:data.text});
	});

	socket.on('broadcast', function (data) {
		console.log("Un usuario envió el mensaje: " + data.text);
		socket.broadcast.emit('broadcastCallback', { text:data.text});
	});
});


