SFApp.controller('BlogController', function($rootScope,$scope,Players,AuthService,BlogService,$firebaseArray,$http){
try{
     	var ref = new Firebase("saberfront-skillbase.firebaseio.com");

		var auth = AuthService;
     $scope.isLoggedIn = false;
     auth.$onAuth(function(authData){
         
 		var obj =  Players.$getRecord(authData.uid);
 		if(obj){
 		    $scope.isLoggedIn = true;
 		}
    $scope.blog = {};
    $scope.blog.title = "Saberfront Skillbase Blog";
    
    $scope.blog.posts = {};
    
      $scope.blog.posts = BlogService;

    
    $scope.blog.tab = 'blog';
    
    $scope.blog.selectTab = function(setTab){
      $scope.blog.tab = setTab;
     console.log($scope.blog.tab);
    };
    
    $scope.blog.isSelected = function(checkTab){
      return $scope.blog.tab === checkTab;
    };
    
    $scope.blog.post = {};
$scope.blog.addPost = function(){
      $scope.blog.post.createdOn = Date.now();
       $scope.blog.post.comments = [""];
       $scope.blog.post.likes = 0;
       
       BlogService.$add($scope.blog.post).then(function(ref){
       });
       $scope.blog.posts.unshift(this.post);
       $scope.blog.tab = 0;
       
       
    };   
     $scope.login = function(){
     	auth.$authWithPassword({
	email: $scope.email,
	password: $scope.pass
}).then(function(userData){
	if(userData){
		var authData = userData;
		$scope.authData = authData;
		$scope.isLoggedIn = true;
	console.log(userData);
	}
	
});
     };
  });
} catch(er){

alert(er);
}
});
  SFApp.controller('CommentController', function(BlogService){
  	try{
      this.BlogService = BlogService;
      
    this.comment = {};
    this.like = function(post){
         
     var befpost = post;
     if(obj){
     	
     	if(obj.blogLikes[BlogService.$indexFor(BlogService.$keyAt(befpost))] == null){
                post.likes = post.likes+1;
                obj.blogLikes.unshift(BlogService.$indexFor(BlogService.$keyAt(post)));
                  BlogService[BlogService.$indexFor(BlogService.$keyAt(befpost))] = post;

          BlogService.$save(BlogService.$indexFor(BlogService.$keyAt(post))).then(function(ref){
       
      });
     	}
     }
                
              };
    this.addComment = function(post){
     var befpost = post;
      this.comment.createdOn = Date.now();
      post.comments.unshift(this.comment);
          BlogService[BlogService.$indexFor(BlogService.$keyAt(befpost))] = post;
      BlogService.$save(BlogService.$indexFor(BlogService.$keyAt(post))).then(function(ref){
       ref.key === BlogService.$indexFor(BlogService.$keyAt(post));
      });
    
      this.comment ={};
    };
    } catch(er){
alert(er);
}


    });
