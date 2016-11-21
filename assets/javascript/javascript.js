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
	var turnObj = database.child("turn");
	var chatDbObj	= database.child("chat");
	var currentPlayer = null;
	
	var newPlayerPosition = 0;
	var turn = 1;
	var options = ['Rock', 'Paper', 'Scissors'];
	

	var playerData = 
		{ 1 : { userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		guess: "",
		lastGuess: "", 
		// options: ['Rock', 'Paper', 'Scissors'],
		options: [],
		timestamp: firebase.database.ServerValue.TIMESTAMP}, 
		2: { userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		guess: "",
		lastGuess: "", 
		// options: ['Rock', 'Paper', 'Scissors'],
		options: [],
		timestamp: firebase.database.ServerValue.TIMESTAMP}};
	
	var objLength = Object.keys(playerData).length;

	// set what happens on disconnect - need to reset the position
	var positionRef = database.child("playerPosition");

	function selectOption(player, guess){
        // console.log("in options function");
		// var player = $(this).data("player");
		// console.log(this);
		// if it is the current players turn then allow them to select
		if (player === turn){
			// capture the value and player data
			// var player = $(this).data("player");
			// store last guess 
			playerData[player].lastGuess = playerData[player].guess;
			// capture current guess
			playerData[player].guess = guess;
			playerDbObj.child(player).child('guess').set(guess);
			// $('.hide-initially-player' + player +' .gameplay').hide();
			$('.player' + player + "-options").hide();
			
			$('#player' + player + "-choice").show();
			
	            
            database.child("players").child(player).child('options').child('0').set("");
            database.child("players").child(player).child('options').child('1').set("");
            database.child("players").child(player).child('options').child('2').set("");
	           
			
	            
			// set turns
			if (turn === 2){
				// check who won
				if (playerData[turn].guess === playerData[turn-1].guess){
					//draw
					console.log("draw");
				} 
				else if (((playerData[turn].guess === 'rock') && (playerData[turn-1].guess === 'scissors' )) || ((playerData[turn].guess === 'scissors') && (playerData[turn-1].guess === 'paper' ))|| ((playerData[turn].guess === 'paper') && (playerData[turn-1].guess === 'rock' ))) {
					// palyer 2 wins
					console.log("player 2 wins");
				}
				else if (((playerData[turn-1].guess === 'rock') && (playerData[turn].guess === 'scissors' )) || ((playerData[turn-1].guess === 'scissors') && (playerData[turn].guess === 'paper' ))|| ((playerData[turn-1].guess === 'paper') && (playerData[turn].guess === 'rock' ))) {
					// palyer 1 wins
					console.log("player 1 wins");
				}

				turn = 1;
				turnObj.set(turn);
			} 
			else {
				turn = 2;
				turnObj.set(turn);
			}
		}
	}

	// set inintial values
	database.child('playerPosition').set(newPlayerPosition);
	turnObj.set(turn);

	if (playerData[1].userid === "")
	{
		positionRef.onDisconnect().set(0);
	}
    else if (playerData[2].userid === "")
	{
		positionRef.onDisconnect().set(1);
	}    

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
				$('#player' + i + '-rock').html(snapshot.child("players").child(i).val().options[0]);
				$('#player' + i + '-paper').html(snapshot.child("players").child(i).val().options[1]);
				$('#player' + i + '-scissors').html(snapshot.child("players").child(i).val().options[2]);
				$('#player' + i + '-choice').html(snapshot.child("players").child(i).val().guess);
				
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
			// if there are 2 players then display turn information
			if (newPlayerPosition ===  2){
				$('#turn').removeClass('hide');
				$('#turn').html("It is " + playerData[turn].userid + "'s turn to choose.")
			}
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
	});

	$('#player-name-submit').on('click', function(){
		// **** prevent "" being entered.
		newPlayerPosition++;
		
		if ( playerData[newPlayerPosition].userid === "" ) {
			
			//hide add user on dom for this user - do this by adding the class hide
	        
	    	$('.hide-initially-player' + newPlayerPosition).show();
			$('#chat-history-div').removeClass('hide');
			$('#chat-submit-div').removeClass('hide');
			$('.show-initially-player' + newPlayerPosition).hide();
			$('.show-initially-player').addClass('hide');
			playerData[newPlayerPosition].options = options;

		
			// database.child('turn').set(turn);
			database.child('playerPosition').set(newPlayerPosition);
			currentPlayer = $('#player-name').val().trim();

			playerData[newPlayerPosition].userid = $('#player-name').val().trim();
			playerDbObj.child(newPlayerPosition).set(playerData[newPlayerPosition]);
		   
			// remove user on disconnect
			var presenceRef = playerDbObj.child(newPlayerPosition);
			// // Write a string when this client loses connection
			presenceRef.onDisconnect().remove();

			for (var j = 0; j < 3; j++){
				var id = ('#player' + newPlayerPosition + '-' + playerData[newPlayerPosition].options[j]).toLowerCase();
				console.log(id);
				$(id).show();
				console.log(playerData[newPlayerPosition].options[j]);
				$(id).html(playerData[newPlayerPosition].options[j]);
			}
   
		
		}
	});

	$('#submit-chat').on('click', function(){
		var chatInput = currentPlayer + ' said: ' + $('#chat-input').val().trim();
		// clear chat input
		$('#chat-input').val('');
    	chatDbObj.push(chatInput);

    	return false;
	});
		
	$('.player1-options').on('click', function(){
		var player = $(this).data("player");
		var guess = $(this).data("guess");
		selectOption(player, guess);

	});

	$('.player2-options').on('click', function(){
		var player = $(this).data("player");
		var guess = $(this).data("guess");
		selectOption(player, guess);

	});	

})

