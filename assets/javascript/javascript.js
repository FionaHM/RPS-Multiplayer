$('document').ready(function(){

	// Initialize Firebase
	var config = {
	    apiKey: "AIzaSyAPASmDYnOxL0OoX-LQCKL86Q1ivqkPZuo",
	    authDomain: "rockpaperscissors-af20f.firebaseapp.com",
	    databaseURL: "https://rockpaperscissors-af20f.firebaseio.com",
	    storageBucket: "rockpaperscissors-af20f.appspot.com",
	    messagingSenderId: "513702418951"};

	 	firebase.initializeApp(config);

	var database =  firebase.database().ref("multiplayer-rps");
	var playerDbObj = database.child("players");
	var turnObj = database.child("turn");
	var chatDbObj	= database.child("chat");
	var positionRef = database.child("playerPosition");
	var currentPlayer = null;
	var resetDOM = false;
	var newPlayerPosition = 1;
	var winnerSelected = false;
	var currentPlayerNo = null;
	var turn = 1;
	var options = ['Rock', 'Paper', 'Scissors'];
	var message = "";
	var playerData = 
		{ 1 : { userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		guess: "",
		lastGuess: "", 
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
		options: [],
		choiceMade: false,
		timestamp: firebase.database.ServerValue.TIMESTAMP}};

	var chat = {
		chatInput: "",
		chatUser: "",
		timestamp: firebase.database.ServerValue.TIMESTAMP
	}
	
	var objLength = Object.keys(playerData).length;


	function selectOption(player, guess){
		// if it is the current players turn then allow them to select
		if (player === turn){
			// move to next player
			if (turn === 1){
				turn = 2;
				turnObj.set(turn);
			}
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
			// change view on the DOM for current player only
			$('.player' + player + "-options").hide();
			$('#player' + player + "-choice").removeClass("hide");
			$('#player' + player + "-choice").html(guess);
			
			
			// // move to next player
			// else if (turn === 2){
			// 	turn = 1;
			// 	turnObj.set(turn);
			// }
			// only start when there are 2 players and each has made a choice
			if ((turn === 2 ) && (playerData[2].choiceMade) && playerData[1].choiceMade){
				playGame();
			}
		}
		
	}; // end of function selectOption

	function displayMessage(message){
		// display message function
		console.log("value passed" +  message);
		database.child("message").set(message);
	}

	// players selects an option
	function playerSelection(player, guess){

		console.log(currentPlayer);
		if ((currentPlayer === playerData[player].userid) && (!playerData[player].choiceMade)){
			selectOption(player, guess);
		}
	}

	function playGame(){
		// if its player 2's turn and both players have selected an option
		// then see who won 
		// display scores and reset for another round of RPS after 4 seconds
		var player = turn;
		// check who won
		if (playerData[player].guess === playerData[player-1].guess){
			//draw
			message =  "Its a draw!";
			console.log("draw:" +  message);
			displayMessage(message);
			playerData[2].draws = playerData[2].draws + 1;
			// console.log(playerData[player].draws);
			playerData[1].draws = playerData[1].draws + 1;
			// console.log(playerData[player-1].draws);
			playerDbObj.set(playerData);
			winnerSelected = true;
			database.child('winnerSelected').set(winnerSelected);

		} 
		else if (((playerData[player].guess === 'Rock') && (playerData[player-1].guess === 'Scissors' )) || ((playerData[player].guess === 'Scissors') && (playerData[player-1].guess === 'Paper' ))|| ((playerData[player].guess === 'Paper') && (playerData[player-1].guess === 'Rock' ))) {
			// palyer 2 wins
			message = playerData[player].userid + " has won this round!";
			 console.log("p2 wins:" +  message);
			displayMessage(message);
			// console.log(message);
			playerData[player].wins++;
			playerData[player-1].losses++;
			playerDbObj.set(playerData);
			winnerSelected = true;
			database.child('winnerSelected').set(winnerSelected);
			
		}
		else if (((playerData[player-1].guess === 'Rock') && (playerData[player].guess === 'Rcissors' )) || ((playerData[player-1].guess === 'Scissors') && (playerData[player].guess === 'Paper' ))|| ((playerData[player-1].guess === 'Paper') && (playerData[player].guess === 'Rock' ))) {
			// palyer 1 wins
			message = playerData[player-1].userid + " has won this round!";
			console.log("p1 wins:" +  message);
			displayMessage(message);
			playerData[player-1].wins++;
			playerData[player].losses++;
			playerDbObj.set(playerData);
			winnerSelected = true;
			database.child('winnerSelected').set(winnerSelected);
			
		}
		// wait 4 secs before starting the next game
		setTimeout(resetNextPlay, 4000);

	}

	function resetNextPlay(){
		// reset for next game
		message = '';
		console.log("reset:" +  message);
		displayMessage(message);
		// console.log(message);
		var player = turn;
		// update the turn
		turn = 1;
		turnObj.set(turn);
		// var playerNext = player - 1;
		var prevPlayer = parseInt(player) - 1;
		playerData[player].choiceMade = false;
		playerData[prevPlayer].choiceMade = false;
		playerData[player].options = options;
		playerData[prevPlayer].options = options;
		playerData[player].guess = '';
		playerData[prevPlayer].guess = '';
		playerDbObj.set(playerData);
		winnerSelected = false;
		database.child('winnerSelected').set(winnerSelected);



	}

	database.on("value", function(snapshot) {
	/// on load check to see if the players exist and put them on the DOM if they do
	 	for (var i=1; i <= objLength; i++){
			if (snapshot.child("players").child(i).exists()) {
				//modify default display on DOM depending on how many players exist
				$('.hide-initially-player' + i).show();
				$('.show-initially-player' + i).hide();
				// display data retrieved on the DOM for each player
				$('#player' + i).html(snapshot.child("players").child(i).val().userid);
				$('#player' + i + '-name').html(snapshot.child("players").child(i).val().userid);
				$('#player' + i + '-wins').html(snapshot.child("players").child(i).val().wins);
				$('#player' + i + '-losses').html(snapshot.child("players").child(i).val().losses);
				$('#player' + i + '-draws').html(snapshot.child("players").child(i).val().draws);
				$('#player' + i + '-rock').html(snapshot.child("players").child(i).val().options[0]);
				$('#player' + i + '-paper').html(snapshot.child("players").child(i).val().options[1]);
				$('#player' + i + '-scissors').html(snapshot.child("players").child(i).val().options[2]);
				$('#player' + i + '-choice').html(snapshot.child("players").child(i).val().guess);
				
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

		}

		// set flag for winner selected
		winnerSelected = snapshot.val().winnerSelected;
		// update the message displayed
		$('#message').html(snapshot.child("message").val());
		// message = snapshot.child("message").val().message;
		console.log("db" + message);
		// if both players exist then display chat and other information
		if (snapshot.child("players").child(1).exists() && snapshot.child("players").child(2).exists()){
			$('#turn').removeClass('hide');
			$('#turn').html("It is <strong>" + playerData[turn].userid + "'s</strong> turn to choose.");
			$('.show-initially-player').addClass('hide');
			$('#chat-history-div').removeClass('hide');
		    $('#chat-submit-div').removeClass('hide');
		} 
		//empty chat if nothing exists in db
		if (snapshot.child("chat").exists() === null){
			$('#chat-history-div').html('');
		}
		// set the turn variable to the value in the database
		turn = snapshot.val().turn;

		

	
	});

		
	$('#player-name-submit').on('click', function(){
		// **** prevent "" being entered.
		// newPlayerPosition++;
		
		console.log(newPlayerPosition);
		for (var i = 1; i <= 2; i++){
			// find the next available slot
			if (playerData[i].userid === ""	){
				newPlayerPosition = i;
				// currentPlayerNo = newPlayerPosition;
				console.log(newPlayerPosition);
				//once position determined exit loop
				break;
			}
		}
		// console.log(newPlayerPosition);
		// put player at the newPlayerPosition position - but double check it is empty first
		console.log("userd" + playerData[newPlayerPosition].userid);
		if ( playerData[newPlayerPosition].userid === "" ) {
		//hide add user on dom for this user - do this by adding the class hide
	    	$('.hide-initially-player' + newPlayerPosition).show();
			$('.show-initially-player' + newPlayerPosition).hide();
			$('.show-initially-player').addClass('hide');
			// set the game options to be displayed
			playerData[newPlayerPosition].options = options;
			// set the current player for this current instance of the game
			currentPlayer = $('#player-name').val().trim();
			playerData[newPlayerPosition].userid = currentPlayer;
			$('#player' + newPlayerPosition).html(currentPlayer);
			$('#current-player').removeClass('hide');
			$('#current-player').html("Logged-In Player: " + playerData[newPlayerPosition].userid + '<br>');
			// save to the playerData object
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

			var newPostRef = chatDbObj.push();
		    if (currentPlayer !== ""){
			    newPostRef.onDisconnect().set({
				chatInput:  " has left",
				chatUser: currentPlayer, 
				timestamp: firebase.database.ServerValue.TIMESTAMP
				})
			}
		}

        return false;
	});

	// Game play section
	
	//player 1 selects
	$('.player1-options').on('click', function(){
		//only allow player whose turn it is to choose
		console.log("position" + newPlayerPosition + "turn" + turn);
		if ( newPlayerPosition = turn ){
			var player = $(this).data("player");
			var guess = $(this).data("guess");
			console.log(player + "player" +  guess + "guess");
			playerSelection(player, guess);
		}
		

		return false;
	});
	//player 2 selects
	$('.player2-options').on('click', function(){
		///only allow player whose turn it is to choose
		console.log("position" + newPlayerPosition + "turn" + turn);
		if ( newPlayerPosition = turn ){
			var player = $(this).data("player");
			var guess = $(this).data("guess");
			console.log(player + "player");
			playerSelection(player, guess);	
		}
		return false;
	});	


	// Chat section 
	$('#submit-chat').on('click', function(){
		// console.log("position" + newPlayerPosition + "turn" + turn);
		chat.chatInput = $('#chat-input').val().trim();
		chat.chatUser = currentPlayer;
		// clear chat input
		$('#chat-input').val('');
    	chatDbObj.push(chat);
    	// what to do on disconnect
    	return false;

	});
	
	/// not captureing current user arrrrrrggggghhhhh!



	


	chatDbObj.orderByKey().on("child_added", function(childSnapshot, prevChildKey) {

		// childSnapshot pulls in the lastest chat addition to the db.
		if (childSnapshot.exists()) {
			//  appends the contents of the chat object to the dom

		 	var newdate = moment(childSnapshot.val().timestamp).format("hh:mm:ss");
			var newPost = "At " + newdate + ', ' + childSnapshot.val().chatUser + " :      " +childSnapshot.val().chatInput;
			// for (var i=1; i<=objLength; i++ ){
			$('#chat-history').append(newPost + '<br>');
			// var newPostRef = chatDbObj.push();
			
		}

	});


	




	//	set initial values
	// database.child('playerPosition').set(newPlayerPosition);
	turnObj.set(turn);
	database.child('message').set(message);
	console.log(message);
	
	// clear DOM
	if( winnerSelected ){
		$('.choice').addClass("hide");
	}

	
	
	// reset player position on disconnect to allow new players to join
	if (playerData[1].userid === "")
	{
		positionRef.onDisconnect().set(0);	

	}
    else if (playerData[2].userid === "")
	{
		positionRef.onDisconnect().set(1);

	}    


	if ((playerData[1].userid === "") && (playerData[2].userid === "")){
		// if no players clear the chat history
		$('#chat-history').html('');
		chatDbObj.set(null);

	}
    
    // var exitChat = chatDbObj;
    // chat.chatInput: "player has left";

	// 	chatUser: '',
	// 	timestamp: firebase.database.ServerValue.TIMESTAMP
	// });

    // exitChat.child("chatUser").onDisconnect().set("1");
    // exitChat.child("chatInput").onDisconnect().set("player has left");
    // exitChat.child("timestamp").onDisconnect().set("timestamp: firebase.database.ServerValue.TIMESTAMP");

	// chatDbObj.onDisconnect().set({
	// 	chatInput: " has left",
	// 	chatUser: currentPlayer,
	// 	timestamp: firebase.database.ServerValue.TIMESTAMP
	// });

	// var amOnline = new Firebase('https://<demo>.firebaseio.com/.info/connected');
	// var userRef = new Firebase('https://<demo>.firebaseio.com/presence/' + userid);
	// chatDbObj.on('value', function(snapshot) {


})

