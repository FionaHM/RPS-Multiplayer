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
	var chatDbObj	= database.child("chat");
	// var turnDbObj = database.child("turn");
	// var currentPlayerDbObj = database.child("currentPlayer");
	var newPlayerPosition = 1;
	var turn = 1;

	var playerData = 
		{ 1: {userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		lastGuess: "", 
		isActive: true,
		timestamp: firebase.database.ServerValue.TIMESTAMP}, 
		2 : {userid: "",
		wins: 0,
		losses: 0,
		draws: 0,
		lastChat: "",
		lastGuess: "", 
		isActive: true,
		timestamp: firebase.database.ServerValue.TIMESTAMP}}
	
	var objLength = Object.keys(playerData).length;
	// var currentPlayer = 2;





	// playerDbObj.on("value", function(snapshot) {
	// 	/// on load check to see if the players exist and put them on the DOM if they do
	// 	for (var i=1; i <= objLength; i++){
	// 		console.log(i);
	// 		if (snapshot.child(i).exists()) {
	// 			$('.hide-initially').show();
	// 			$('.show-initially').hide();
	// 			$('#player' + i + '-name').html(snapshot.child(i).val().userid);
	// 			$('#player' + i + '-wins').html(snapshot.child(i).val().wins);
	// 			$('#player' + i + '-losses').html(snapshot.child(i).val().losses);
	// 			$('#player' + i + '-draws').html(snapshot.child(i).val().draws);
	// 			// $('.show-user').html(snapshot.child(i).val().userid);
	// 		}
	// 	}
	// });

	database.on("value", function(snapshot) {
		/// on load check to see if the players exist and put them on the DOM if they do
		for (var i=1; i <= objLength; i++){
			console.log(i);
			if (snapshot.child("players").child(i).exists()) {
				$('.hide-initially-player' + i).show();
				$('.show-initially-player' + i).hide();
				$('#player' + i + '-name').html(snapshot.child("players").child(i).val().userid);
				$('#player' + i + '-wins').html(snapshot.child("players").child(i).val().wins);
				$('#player' + i + '-losses').html(snapshot.child("players").child(i).val().losses);
				$('#player' + i + '-draws').html(snapshot.child("players").child(i).val().draws);
				// $('.show-user').html(snapshot.child(i).val().userid);
				newPlayerPosition = snapshot.val().playerPosition;
				turn = snapshot.val().turn;
				console.log("child" + i + "exists");
				var localData = 'player' + i;
				sessionStorage.setItem('player', localData);
				// if (sessionStorage.getItem('player') === localData ){
				// 	$('.show-initially').hide();
				// }

			}
		}

	});

	

	$('#player-name-submit').on("click", function(){
		// capture the new players name 
		console.log("this va;" + $('#player-name').val());
		
		// timestamp: firebase.database.ServerValue.TIMESTAMP
		// see which  position is free
		// set turn to player 1 initially
		database.child('turn').set(turn);
		database.child('playerPosition').set(newPlayerPosition);
		// database.child('newPlayerPosition').set(newPlayerPosition);
		if ( playerData[newPlayerPosition].userid === "" ) {
			playerData[newPlayerPosition].userid = $('#player-name').val().trim();
			playerDbObj.child(newPlayerPosition).set(playerData[newPlayerPosition]);
			var localData = 'player' + newPlayerPosition;
			sessionStorage.setItem('player', localData);
			if (sessionStorage.getItem('player') === localData ){
					$('.show-initially').hide();
			}
			//move to next position in player object
			newPlayerPosition = newPlayerPosition + 1;
			// store this in the database
			database.child('playerPosition').set(newPlayerPosition);
			// set some local session storage - just for hiding the input box for current player only and not both
		
		} 
	
		// else if (!snapshot.child(newPlayerPosition).exists()) {
		// 	playerDb.child(newPlayerPosition).set(playerData[newPlayerPosition]);
		// }

		// return false;


	})
		

})
