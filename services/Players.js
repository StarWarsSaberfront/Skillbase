SFApp.factory("Players",function($firebaseArray){
	var ref = new Firebase("saberfront-skillbase.firebaseio.com");
		var Players = $firebaseArray(ref.child("Players"));
		return Players;

});
