SFApp.controller("EditProfileController",function($scope,Players,AuthService){
     	var auth = AuthService;
         $scope.isLoggedIn = false;
  
 auth.$onAuth(function(authData){
 		var obj =  Players.$getRecord(authData.uid);
	$scope.dat = obj;
	$scope.changeUserName = function(){
	  $scope.dat.name = $scope.name;
	  	Players[Players.$indexFor(authData.uid)] = $scope.dat;
  	Players.$save(Players.$indexFor(authData.uid)).then(function(ref){
  		ref.key() === authData.uid;
  	});
	};
});
});
