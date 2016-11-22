$('document').ready(function(){

	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyAPASmDYnOxL0OoX-LQCKL86Q1ivqkPZuo",
	    authDomain: "rockpaperscissors-af20f.firebaseapp.com",
	    databaseURL: "https://rockpaperscissors-af20f.firebaseio.com",
	    storageBucket: "rockpaperscissors-af20f.appspot.com",
	    messagingSenderId: "513702418951"};

	 	firebase.initializeApp(config);

	// var k = 0;
	var database =  firebase.database().ref("multiplayer-rps");
	var playerDbObj = database.child("players");
	var player1DbObj = playerDbObj.child("1");
	var player2DbObj = playerDbObj.child("2");
	var turnObj = database.child("turn");
	var chatDbObj	= database.child("chat");
	// var choiceDbObj	= database.child("choice");
	var currentPlayer = null;
	var resetDOM = false;
	
	var newPlayerPosition = 0;
	var turn = 1;
	var options = ['Rock', 'Paper', 'Scissors'];
	// var choiceMade = [false, false];
	

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
		choiceMade: false,
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
		choiceMade: false,
		timestamp: firebase.database.ServerValue.TIMESTAMP}};
	
	var objLength = Object.keys(playerData).length;

	// set what happens on disconnect - need to reset the position
	var positionRef = database.child("playerPosition");

	function selectOption(player, guess){
		// if it is the current players turn then allow them to select
		if (player === turn){
			// store previous as lastguess before setting current guess
			playerData[player].lastGuess = playerData[player].guess;
			// capture current guess
			playerData[player].guess = guess;
		    // empty the options object in the database 
	        // this allows the options to be hidden for both players
			playerData[player].options = ["","",""];
			// set choice made
			playerData[player].choiceMade = true;
			// update database with playerData object
			playerDbObj.child(player).set(playerData[player]);
			// change view on the DOM
			$('.player' + player + "-options").hide();
			$('#player' + player + "-choice").show();
			// move to next player
			if (turn === 1){
				turn = 2;
				turnObj.set(turn);
			}
			// change turns
			// if (turn === 2 ) {
			// 	turn = 1;
			// 	turnObj.set(turn);
			// } 
			// else {
			// 	turn = 2;
			// 	turnObj.set(turn);
			// }
			// call the play game function
			// not allowing me put [player] in object
			// var prevPlayer = parseInt(player) - 1;
			// console.log("p2 choice" + playerData[player].choiceMade);
			// console.log("p1 choice" + playerData[prevPlayer].choiceMade);

			if ((turn === 2 ) && (playerData[2].choiceMade) && playerData[1].choiceMade){
				playGame();
			}
		}
		
	}; // end of function selectOption

	function playGame(){

		// if its player 2 turn and both players have selected an option
		// then see who won 
		// display scores and reset for another round of RPS
		var player = turn;
		// check who won
		console.log("2 guess " + playerData[player].guess);
		console.log("1 guess " + playerData[player-1].guess);
		if (playerData[player].guess === playerData[player-1].guess){
			//draw
			// console.log("playerData[player].draw");
			playerData[2].draws = playerData[2].draws + 1;
			console.log(playerData[player].draws);
			playerData[1].draws = playerData[1].draws + 1;
			console.log(playerData[player-1].draws);
			playerDbObj.set(playerData);

		} 
		else if (((playerData[player].guess === 'rock') && (playerData[player-1].guess === 'scissors' )) || ((playerData[player].guess === 'scissors') && (playerData[player-1].guess === 'paper' ))|| ((playerData[player].guess === 'paper') && (playerData[player-1].guess === 'rock' ))) {
			// palyer 2 wins
			console.log("player 2 wins");
			playerData[player].wins++;
			playerData[player-1].losses++;
			playerDbObj.set(playerData);
			
		}
		else if (((playerData[player-1].guess === 'rock') && (playerData[player].guess === 'scissors' )) || ((playerData[player-1].guess === 'scissors') && (playerData[player].guess === 'paper' ))|| ((playerData[player-1].guess === 'paper') && (playerData[player].guess === 'rock' ))) {
			// palyer 1 wins
			console.log("player 1 wins");
			playerData[player-1].wins++;
			playerData[player].losses++;
			playerDbObj.set(playerData);
			
		}
		// ****modal message then reset
		// not working as expected!!!!!! too fast.
		setTimeout(resetNextPlay(player), 10000);
		
              


	}

	function resetNextPlay(player){
		// reset for next game
		console.log("in here + player" + player);
		var prevPlayer = parseInt(player) - 1;
		playerData[player].choiceMade = false;
		playerData[player].options = options;
		playerData[player-1].choiceMade = false;
		playerData[player-1].options = options;
		playerData[player].guess = "";
		playerData[player-1].guess = "";

		// playerDbObj.set(playerData);
		// update database?
		playerDbObj.set(playerData);
		// reset DOM
		//
		turn = 1;
		turnObj.set(turn);




	}
	
	database.on("value", function(snapshot) {
		/// on load check to see if the players exist and put them on the DOM if they do
		// for (var i=1; i <= objLength; i++){

	 	for (var i=1; i <= objLength; i++){
			if (snapshot.child("players").child(i).exists()) {
				//modify display on DOM depending on how many players exist
				$('.hide-initially-player' + i).show();
				$('#chat-history-div').removeClass('hide');
				$('#chat-submit-div').removeClass('hide');
				$('.show-initially-player' + i).hide();
				// display data retrieved on the DOM for each player
				$('#player' + i + '-name').html(snapshot.child("players").child(i).val().userid);
				$('#player' + i + '-wins').html(snapshot.child("players").child(i).val().wins);
				$('#player' + i + '-losses').html(snapshot.child("players").child(i).val().losses);
				$('#player' + i + '-draws').html(snapshot.child("players").child(i).val().draws);
				$('#player' + i + '-rock').html(snapshot.child("players").child(i).val().options[0]);
				$('#player' + i + '-paper').html(snapshot.child("players").child(i).val().options[1]);
				$('#player' + i + '-scissors').html(snapshot.child("players").child(i).val().options[2]);
				$('#player' + i + '-choice').html(snapshot.child("players").child(i).val().guess);
				
				// set the turn variable to the value in the database
				turn = snapshot.val().turn;
				// update the playerData object with the values in the database
				playerData[i].userid = snapshot.child("players").child(i).val().userid;
				playerData[i].wins = snapshot.child("players").child(i).val().wins;
				playerData[i].losses = snapshot.child("players").child(i).val().losses;
				playerData[i].draws = snapshot.child("players").child(i).val().draws;
				playerData[i].lastGuess = snapshot.child("players").child(i).val().lastGuess;
				playerData[i].guess = snapshot.child("players").child(i).val().guess;
				playerData[i].lastChat = snapshot.child("players").child(i).val().lastChat;
				playerData[i].options = snapshot.child("players").child(i).val().options;
				playerData[i].choiceMade = snapshot.child("players").child(i).val().choiceMade;


			}
			else{
				// if a player does not exist any longer - reset the DOM
				$('.hide-initially-player' + i).hide();
				$('.show-initially-player' + i).show();
			}
			// place the most up to date position data in the newPlayerPosition variable
			newPlayerPosition = snapshot.child("playerPosition").val();
			// if there are 2 players then display turn information
			// whose turn is it - player 1 or 2
			if (newPlayerPosition ===  2){
				$('#turn').removeClass('hide');
				$('#turn').html("It is " + playerData[turn].userid + "'s turn to choose.")
			
			}
		}
	});


	
	$('#player-name-submit').on('click', function(){
		// **** prevent "" being entered.
		newPlayerPosition++;
		// if no player at this  newPlayerPosition position - then add it
		if ( playerData[newPlayerPosition].userid === "" ) {
			//hide add user on dom for this user - do this by adding the class hide
	    	$('.hide-initially-player' + newPlayerPosition).show();
			$('#chat-history-div').removeClass('hide');
			$('#chat-submit-div').removeClass('hide');
			$('.show-initially-player' + newPlayerPosition).hide();
			$('.show-initially-player').addClass('hide');

			// set the game options to be displayed
			playerData[newPlayerPosition].options = options;
			// set the current player position in the database
			database.child('playerPosition').set(newPlayerPosition);
			// set the current player for this current instance of the game
			currentPlayer = $('#player-name').val().trim();
			$('#current-player').removeClass('hide');
			$('#current-player').html("Current Player: " + currentPlayer + '<br>');
			// save to the playerData object
			playerData[newPlayerPosition].userid = $('#player-name').val().trim();
			// save to the database
			playerDbObj.child(newPlayerPosition).set(playerData[newPlayerPosition]);
			// remove user on disconnect
			var presenceRef = playerDbObj.child(newPlayerPosition);
			presenceRef.onDisconnect().remove();
			// put the game options on the DOM for the current player
			for (var j = 0; j < options.length; j++){
				var id = ('#player' + newPlayerPosition + '-' + playerData[newPlayerPosition].options[j]).toLowerCase();
				$(id).show();
				$(id).html(playerData[newPlayerPosition].options[j]);
			}
   
		
		}
	});

	// Game play section
	$('.player1-options').on('click', function(){
		var player = $(this).data("player");
		var guess = $(this).data("guess");
	
		if ((currentPlayer === playerData[player].userid) && (!playerData[player].choiceMade)){
			selectOption(player, guess);
		}
	});

	$('.player2-options').on('click', function(){
		var player = $(this).data("player");
		var guess = $(this).data("guess");
		
		if ((currentPlayer === playerData[player].userid) && (!playerData[player].choiceMade)){
			selectOption(player, guess);
		}
	});	


	// Chat section 
	$('#submit-chat').on('click', function(){
		var chatInput = currentPlayer + ' said: ' + $('#chat-input').val().trim();
		// clear chat input
		$('#chat-input').val('');
    	chatDbObj.push(chatInput);

    	return false;
	});

	chatDbObj.on("child_added", function(childSnapshot, prevChildKey) {
		
		if (childSnapshot.exists()) {
			var chatObjLength =  Object.keys(childSnapshot).length;
			for (var i = 1; i <=  chatObjLength; i++){
					var newPost = childSnapshot.val();
					console.log("Author: " + newPost.author);
					console.log("Title: " + newPost.title);
					console.log("Previous Post ID: " + prevChildKey);
							
					$('#chat-history').append(childSnapshot.val() + '<br>');
			}
		
		}
	});



	// set initial values
	database.child('playerPosition').set(newPlayerPosition);
	turnObj.set(turn);
	// game play

	
	// reset player position on disconnect

	if (playerData[1].userid === "")
	{
		positionRef.onDisconnect().set(0);
	}
    else if (playerData[2].userid === "")
	{
		positionRef.onDisconnect().set(1);
	}    

})

