//Función Javascript
var serverIP = '192.168.1.38';
var port = 3000;
var users = new Array();
var room = "";
try {
	socket = io.connect(serverIP+':'+port+'/'); //Conexion con Socket.io

//			$('#users').append('<i style="color: #5CB85C;"class="glyphicon glyphicon-user"></i>' +' '+ data.text + ' </br>');


	socket.on("updateUsers", function (data)
    {
        //limpiamos el sidebar donde almacenamos usuarios
       			$("#users").html("");
       			$("#users").append('<div class="alert alert-info" id="users">Usuarios conectados: <br></div>');
       			for (var i = 0 ; i < data.length; i++) {
       				var res = data[i].split("#$%&");
       				if($("#tittleRoom").html()==res[1])
       				$('#users').append('<i style="color: #5CB85C;"class="glyphicon glyphicon-user"></i>' +' '+ res[0]+ ' </br>');
       				}
    
        
        //si hay usuarios conectados, para evitar errores
 
    });

	socket.on('enterRoom', function (data) {
		
		if($("#tittleRoom").html()=="")$('#tittleRoom').append(data.text);
	
	});

	socket.on('ingresoUsuario', function (data) {
		if($("#tittleRoom").html()==data.room)$('#chat').append('<div class=" alert-success">' + data.text + data.room + '</div>');
	
	});
	socket.on('salidaUsuario', function (data) {
		if($("#tittleRoom").html()==data.room)$('#chat').append('<div class=" alert-danger">' + data.text + '</div>');
	
	});

	socket.on('broadcastCallback', function (data) {

		if($("#tittleRoom").html()==data.room)$('#chat').append('<div class=" alert-info">' + data.text + '</div>');
	
	});
	socket.on('cargarRadios', function (data){
		
		$('#sala').append('<option value="'+ data["_id"]+'">'+ data["nombre"]+'</option>');
		$('#sala2').append('<option value="'+ data["_id"]+'">'+ data["nombre"]+'</option>');
	});

	socket.on('emitirRadio', function (data){
		if($("#contenedorRadio").html()=="")
		{
			$('#contenedorRadio').append('<audio controls src="'+ data['dirección']+'" id ="radioRep" type="audio/mpeg"></audio>');
		}
	});

	socket.on('emitirRadioERROR', function (data){
			if($("#contenedorRadio").html()=="")
				{
	
					$('#contenedorRadio').append('<div class=" alert-danger">LA RADIO NO ESTA DISPONIBLE</div>');

			}	

	});

	socket.on('maxUsuarios', function (data){
		if($("#contenedorRadio").html()=="")
				{
		$('#cuerpo').html("");
		$('#cuerpo').append('<div class=" alert-danger">LA RADIO HA ALCANZADO LÍMITE DE USUARIOS</div>');
		}
	});
	socket.on('actualizarFormulario', function (data){
		$('#id2').val(data["_id"]);
		$('#nombreRadio2').val(data["nombre"]);
		$('#dirRadio2').val(data["dirección"]);
		$('#numPar2').val(data["maxUsers"]);

	});
	
}
catch (err) {
	alert('No está disponible el servidor Node.js');
}


$(function() {

	$('#btnEntrar').click(function() {
		var message = $('#nombreUsuario').val();
		if(message == ''){message = 'Anónimo';}
		usuario= message;
		var valor = $("#sala2 option:selected").html();
		var x = document.getElementById("sala2").value;
		room = valor;
		socket.emit('initRoom', {room : room});
		socket.emit('actualizarRadio', { text: x });
		socket.emit('ingresoSala', {text:valor});
		socket.emit('ingresoUser', {text: message, room:room, id: x});
	});

	$('#btn-send').click(function() {
		var message =  usuario+ ": "+$('#text-send').val();
		$('#text-send').val('');
		var valor = $("#sala2 option:selected").html();
		room = valor
		socket.emit('broadcast', {text: message, room : room});
	});	
});




$(document).ready(function(){
/*	$('#enviar').click(function () {

		
	});
*/

	$('#sala').change(function () {
	    var x = document.getElementById("sala").value;
		socket.emit('actualizaModificar', { text: x });

		
	});

});