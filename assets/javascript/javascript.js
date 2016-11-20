$('document').ready(function(){

	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyAPASmDYnOxL0OoX-LQCKL86Q1ivqkPZuo",
	    authDomain: "rockpaperscissors-af20f.firebaseapp.com",
	    databaseURL: "https://rockpaperscissors-af20f.firebaseio.com",
	    storageBucket: "rockpaperscissors-af20f.appspot.com",
	    messagingSenderId: "513702418951"};

	 	firebase.initializeApp(config);

	var k = 0;
	var database =  firebase.database().ref("multiplayer-rps");
	var playerDbObj = database.child("players");
	// var player1DbObj = playerDbObj.child("1");
	// var player2DbObj = playerDbObj.child("2");
	var chatDbObj	= database.child("chat");
	var currentPlayer = null;
	
	var newPlayerPosition = 0;
	var turn = 1;

	var playerData = 
		{ 1 : { userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		lastGuess: "", 
		isActive: true,
		timestamp: firebase.database.ServerValue.TIMESTAMP}, 
		2: { userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		lastGuess: "", 
		isActive: true,
		timestamp: firebase.database.ServerValue.TIMESTAMP}};
	
	var objLength = Object.keys(playerData).length;

	// set inintial values
	// database.child('turn').set(turn);
	database.child('playerPosition').set(newPlayerPosition);

	database.on("value", function(snapshot) {
		console.log("in here value" + k);
		k=k+1;

		/// on load check to see if the players exist and put them on the DOM if they do
		for (var i=1; i <= objLength; i++){
			if (snapshot.child("players").child(i).exists()) {
				$('.hide-initially-player' + i).show();
				$('#chat-history-div').removeClass('hide');
				$('#chat-submit-div').removeClass('hide');
				$('.show-initially-player' + i).hide();
				$('#player' + i + '-name').html(snapshot.child("players").child(i).val().userid);
				$('#player' + i + '-wins').html(snapshot.child("players").child(i).val().wins);
				$('#player' + i + '-losses').html(snapshot.child("players").child(i).val().losses);
				$('#player' + i + '-draws').html(snapshot.child("players").child(i).val().draws);
				// newPlayerPosition = i;
				console.log("changed to " + i);
				turn = snapshot.val().turn;
				console.log("to here" );
				playerData[i].userid = snapshot.child("players").child(i).val().userid;
				playerData[i].wins = snapshot.child("players").child(i).val().wins;
				playerData[i].losses = snapshot.child("players").child(i).val().losses;
				playerData[i].draws = snapshot.child("players").child(i).val().draws;
				
			}
			else{
				$('.hide-initially-player' + i).hide();
				$('.show-initially-player' + i).show();
				

			}
			newPlayerPosition = snapshot.child("playerPosition").val();
		}
	});


	chatDbObj.on("child_added", function(childSnapshot) {
		
		console.log(childSnapshot.exists());
				if (childSnapshot.exists()) {
				var chatObjLength =  Object.keys(childSnapshot).length;
				for (var i = 1; i <=  chatObjLength; i++){
					
						$('#chat-history').append(childSnapshot.val() + '<br>');
					}
				
				}
	})

	// database.on("child_added", function(snapshot){
	// 	console.log("what happenenidn");
	// 	for (var i=1; i <= objLength; i++){
			
	// 		if (snapshot.child("players").child(i).exists()) {
				
	// 			$('.hide-initially-player' + i).show();
	// 			$('#chat-history-div').removeClass('hide');
	// 			$('#chat-submit-div').removeClass('hide');
	// 			$('.show-initially-player' + i).hide();
	// 			$('#player' + i + '-name').html(snapshot.child("players").child(i).val().userid);
	// 			$('#player' + i + '-wins').html(snapshot.child("players").child(i).val().wins);
	// 			$('#player' + i + '-losses').html(snapshot.child("players").child(i).val().losses);
	// 			$('#player' + i + '-draws').html(snapshot.child("players").child(i).val().draws);
				
	// 			console.log("what happens here" + newPlayerPosition );
				
	// 			turn = snapshot.val().turn;
	// 			console.log("to here" );
	// 			playerData[i].userid = snapshot.child("players").child(i).val().userid;
	// 			playerData[i].wins = snapshot.child("players").child(i).val().wins;
	// 			playerData[i].losses = snapshot.child("players").child(i).val().losses;
	// 			playerData[i].draws = snapshot.child("players").child(i).val().draws;
				
	// 		}
	// 		else{
	// 			$('.hide-initially-player' + i).hide();
	// 			$('.show-initially-player' + i).show();
				

	// 		}

	// 	}
	// })




	
	$('#player-name-submit').on("click", function(){
		// **** prevent "" being entered.
		newPlayerPosition++;
		
		if ( playerData[newPlayerPosition].userid === "" ) {
			
			//hide add user on dom for this user - do this by adding the class hide
	        
	    	$('.hide-initially-player' + newPlayerPosition).show();
			$('#chat-history-div').removeClass('hide');
			$('#chat-submit-div').removeClass('hide');
			$('.show-initially-player' + newPlayerPosition).hide();
			$('.show-initially-player').addClass('hide');
		
			// database.child('turn').set(turn);
			database.child('playerPosition').set(newPlayerPosition);
			currentPlayer = $('#player-name').val().trim();

			playerData[newPlayerPosition].userid = $('#player-name').val().trim();
			playerDbObj.child(newPlayerPosition).set(playerData[newPlayerPosition]);
		   
			// remove user on disconnect
			var presenceRef = playerDbObj.child(newPlayerPosition);
			// // Write a string when this client loses connection
			presenceRef.onDisconnect().remove();
   
		
		}


	})

	$('#submit-chat').on('click', function(){
		var chatInput = currentPlayer + ' said: ' + $('#chat-input').val().trim();
		// clear chat input
		$('#chat-input').val('');
    	chatDbObj.push(chatInput);

    	return false;
	})

	// set what happens on discconnect - need to reset the position
	var positionRef = database.child("playerPosition");

	if (playerData[1].userid === "")
	{
		positionRef.onDisconnect().set(0);
	}
    else if (playerData[2].userid === "")
	{
		positionRef.onDisconnect().set(1);
	}    

		
	$('.gameplay').on('click', function(){
		console.log($(this).value);
		// set turns
		// validate that there are tow users before play can begin
		// track last guess
		// see who won and set the scores
		// track scores
		
	})

})

