"use strict";angular.module("chesshiveApp",["ngAnimate","ngAria","ngCookies","ngMessages","ngResource","ngRoute","ngSanitize","ngTouch","nywton.chessboard","btford.socket-io"]).constant("applicationConfig",function(){var a=function(){return"@@<!--"+"%build:replace%".toLowerCase()+"-->"!==function(){return"yes"}()},b={name:"unnamed-app",debugEnabled:!0,io:{host:"http://localhost:3000"}},c={"name":"multichess","debugEnabled":false,"io":{"host":"http://chess.openmrc.com:3000"},"google":{"analytics":{"tracker":"UA-48540954-7"}}};return a()?c:b}()).config(["$routeProvider",function(a){a.when("/",{redirectTo:"/play"}).when("/home",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/play",{templateUrl:"views/play.html",controller:"PlayCtrl",controllerAs:"play"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"about"}).otherwise({redirectTo:"/"})}]).config([function(){Messenger.options={extraClasses:"messenger-fixed messenger-on-bottom",theme:"block"}}]).config(["nywtonChessboardConfigProvider",function(a){a.draggable(!0).showNotation(!0).snapbackSpeed(500).snapSpeed(150).moveSpeed("slow").position("").pieceTheme("images/chesspieces/wikipedia/{piece}.png")}]).config(["applicationConfig","$logProvider",function(a,b){b.debugEnabled(a.debugEnabled)}]).factory("chessHiveGameSocket",["socketFactory","applicationConfig",function(a,b){var c="Anonymous",d=b.io.host,e=io(d,{forceNew:!0,reconnection:!0,reconnectionAttempts:1e4,reconnectionDelay:1e3,query:"user="+c}),f=a({ioSocket:e});return f}]).filter("firstCharUppercase",function(){return function(a){return a&&("string"==typeof a||a instanceof String)?a.substring(0,1).toUpperCase()+a.substring(1):a}}).controller("HeadCtrl",["applicationConfig",function(a){this.appName=a.name}]).controller("BodyCtrl",["applicationConfig",function(a){this.appName=a.name}]).controller("NavbarCtrl",["applicationConfig",function(a){this.appName=a.name}]),angular.module("chesshiveApp").controller("MainCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("chesshiveApp").controller("PlayCtrl",function(){}).directive("chesshiveGameOverMessage",function(){return{scope:{},template:'<div class="panel panel-default" data-ng-show="model.gameOver"> <div class="panel-heading">  <p style="margin-top:13px;">   <span data-ng-show="model.inDraw">Game over. Game ended in a<strong> a draw</strong>.</span>   <span data-ng-hide="model.inDraw">    <img data-ng-src="{{model.winnerImageSrc}}" style="height:32px; margin-top:-7px;"/>    Game over. <strong>{{gameOverData.winner | firstCharUppercase }}</strong> won.  </p> </div> <div class="panel-body">  <h3>Game over.</h3>  <h4 data-ng-show="!!gameOverData.resignation">    <strong>{{gameOverData.resignation.color | firstCharUppercase }}</strong> resigned.  </h4>  <span data-ng-show="gameOverData.restarts">   A new game will start shortly.  </span>  <div data-ng-if="gameOverData.restarts"     data-chesshive-countdown     data-time="model.countdown"    data-show-progress-bar="static.showProgressBar"   ></div> </div> <div class="panel-footer"> </div></div>',controller:["$scope","$timeout","HiveChessService",function(a,b,c){function d(b){a.gameOverData=b,a.model.gameOver=b.gameOver,a.model.inDraw=b.inDraw,a.model.winnerImageSrc=b.inDraw?"":c.createImageSource(b.winner.charAt(0)+"K"),a.gameOverData.restarts&&(a.model.countdown=a.gameOverData.restartTimeout)}a["static"]={showProgressBar:!0},a.model={gameOver:!1,countdown:0},c.socket().forward("game-over",a),a.$on("socket:game-over",function(a,b){d(b)}),c.socket().forward("new-top-rated-game-move",a),a.$on("socket:new-top-rated-game-move",function(b,c){a.model.gameOver=c.gameOver,a.model.inDraw=c.inDraw,a.gameOverData={}})}]}}).directive("chesshivePlayerStats",["$timeout","chessHiveGameSocket",function(a,b){return{scope:{},template:'<ul class="list-unstyled"><li><i class="fa fa-circle-o"></i> White: {{ playerStats.white | number:0 }}</li><li><i class="fa fa-circle"></i> Black: {{ playerStats.black | number:0 }}</li></ul>',controller:["$scope",function(a){a.playerStats={},b.forward("player-stats",a),a.$on("socket:player-stats",function(b,c){a.playerStats=c})}]}}]).directive("chesshiveSuggestedMoves",["$rootScope","$timeout","chessHiveGameSocket",function(a,b,c){return{scope:{isInTurn:"="},template:'<div data-ng-switch data-on="movesHaveBeenSuggested"><h4>Suggestions</h4><div data-ng-switch-when="false"> <p>No move suggestions yet.</p> <div class="alert bg-primary" data-ng-show="isInTurn">  <div class="row vertical-align">   <div class="col-xs-3">    <span class="fa fa-exclamation-triangle fa-2x"></span>   </div>   <div class="col-xs-9">    Be the first to suggest the next move!   </div>  </div> </div></div><div data-ng-switch-when="true"> <table class="table table-bordered table-condensed table-striped table-hover">  <tr data-ng-repeat="move in suggestedMoves | orderBy:\'value\':true"    data-ng-class="{ success: model.vote.move.san === move.key }">   <td>    <img data-ng-if="move.image"          data-ng-src="images/chesspieces/wikipedia/{{move.image}}"          style="height:20px;" alt="{{move.image}}"/>    <span class="badge badge-default">{{move.key}}</span>    <button class="btn btn-default btn-xs pull-right"        data-ng-click="voteForMove(move.move)"        data-ng-show="!model.voted && move.selectable">      <i class="fa fa-check"></i>    </button>   </td>   <td class="text-right"> {{ move.value | number:0 }} </td>  </tr> </table></div></div>',controller:["$scope",function(b){b.model={vote:null,voted:!1},b.movesHaveBeenSuggested=!1,b.suggestedMoves=null,c.forward("suggested-moves",b),b.$on("socket:suggested-moves",function(a,c){c.team&&(b.movesHaveBeenSuggested=_.keys(c.team).length>0,b.suggestedMoves=[],angular.forEach(c.team,function(a,c){var d=c&&c.charAt(0),e="B"===d||"N"===d||"R"===d||"K"===d||"Q"===d,f=e?a.color.charAt(0)+d+".png":null;b.suggestedMoves.push({key:c,value:a.value,image:f,move:a,selectable:"resign"!==c&&!b.model.voted})}))}),c.forward("new-top-rated-game-move",b),b.$on("socket:new-top-rated-game-move",function(){b.suggestedMoves=null,b.movesHaveBeenSuggested=!1,b.model.vote=null,b.model.voted=!1}),b.voteForMove=function(b){a.$broadcast("chesshive:vote-for-suggested-move",b)},b.$on("chesshive:new-move",function(a,c){b.model.vote=c,b.model.voted=!0})}]}}]).directive("chesshiveCountdown",["$timeout",function(a){return{scope:{time:"=",max:"=?",showProgressBar:"=?",progressBarColor:"=?",showText:"=?"},template:'<div data-ng-show="countdown >= 0"> <span data-ng-show="showText">{{countdown / 1000 | number:precision}}s</span> <div class="progress" data-ng-show="showProgressBar" style="border-radius: 0; height: 5px; margin-bottom: 0;">  <div class="progress-bar progress-bar-striped active"     role="progressbar" aria-valuenow="{{countdown}}" aria-valuemin="0" aria-valuemax="{{timeLengthInMs}}"     style="width: {{ percentage | number:0 }}%">   <span class="sr-only">{{ percentage | number:0 }}% Complete</span>  </div> </div></div>',controller:["$scope",function(b){b.showText=b.showText!==!1,b.showProgressBar=b.showProgressBar!==!1,b.fullSecond=0,b.precision=0,b.percentage=0,b.countdown=0,b.max=0;var c=angular.noop,d=function(){c();var e=100;if(b.countdown=b.initTime-Date.now(),b.countdown<=0)b.countdown=0;else{b.precision=0,b.fullSecond=Math.floor(b.countdown/1e3),b.percentage=b.countdown/b.max*100,b.countdown<=11e3&&(e=10),b.countdown<1e4&&(b.precision=1);var f=b.countdown-1e3*b.fullSecond;e-=f}var g=a(d,e);return c=function(){a.cancel(g),c=angular.noop}};b.$watch("time",function(a){a&&(b.max=a,b.initTime=a+Date.now(),d())}),b.$on("$destroy",function(){c()})}]}}]).directive("chesshiveTimeToNextDigest",["$timeout","chessHiveGameSocket",function(a,b){return{scope:{showProgressBar:"=",showText:"="},template:'<div> <div data-ng-show="!gameOver"> <div data-chesshive-countdown   data-time="model.countdown"  data-show-progress-bar="static.showProgressBar"   data-show-text="static.showText" ></div></div>',controller:["$scope","$timeout",function(a,c){a["static"]={showProgressBar:a.showProgressBar,showText:a.showText},a.model={countdown:0},b.forward("new-top-rated-game-move",a),a.$on("socket:new-top-rated-game-move",function(b,d){a.data=d,a.gameOver=d.gameOver,a.model.countdown=0,c(function(){a.model.countdown=d.nextDigest},1)})}]}}]).factory("HiveChessService",["chessHiveGameSocket","nywtonChessboardConfig",function(a,b){return{socket:function(){return a},createImageSource:function(a){return b.pieceTheme.replace("{piece}",a)}}}]).controller("HiveChessGameCtrl",["$rootScope","$scope","$timeout","HiveChessService",function(a,b,c,d){var e=d.socket();b.board=null;var f=new Chess,g="the-master-board";b.model={joined:!1,turn:null,voted:!1,vote:null,color:null,gameOver:!1,isInTurn:!1,orientation:"white",gameHistoryString:"",pieceImageSrc:null,panelClass:"panel-default"},b.onDragStart=function(a,c){return!b.model.joined||b.model.voted?!1:f.gameOver()===!0||"w"===f.turn()&&-1!==c.search(/^b/)||"b"===f.turn()&&-1!==c.search(/^w/)||f.turn()!==b.model.color.charAt(0)?(console.log("[debug] onDragStart abort"),!1):void 0},b.onDrop=function(a,b){var c="b"===f.turn()?"black":"white",d=f.move({from:a,to:b,promotion:"q"});return null===d?(console.log("[debug] onDrop - illegal move"),"snapback"):void h(c,d.san,a,b)};var h=function(a,c,d,f){if(!b.model.voted){var h={token:g,turn:a,resign:!1,move:{san:c,source:d,target:f}};i(h),e.emit("new-move",h),k()}},i=function(b){a.$broadcast("chesshive:new-move",b),b.resign?Messenger().post({message:"Your move has been suggested: resign",type:"warning",showCloseButton:!0,hideAfter:3}):Messenger().post({message:"Your move has been suggested: "+b.move.source+" -> "+b.move.target,type:"success",showCloseButton:!0,hideAfter:3})};b.$on("chesshive:new-move",function(a){b.model.voted=!0,b.model.vote=a.resign?"resign":a.move}),b.onSnapEnd=function(){b.board.position(f.fen())},e.forward("player-connected",b),b.$on("socket:player-connected",function(a,b){console.log("[debug] socket:player-connected: "+JSON.stringify(b))}),e.forward("self-player-connected",b),b.$on("socket:self-player-connected",function(a,c){console.log("[debug] socket:self-connected: "+JSON.stringify(c));var e=c.side;b.model.joined=!0,b.model.orientation=e,b.model.color=e,b.model.pieceImageSrc=d.createImageSource(e.charAt(0)+"K"),b.board.orientation(e)});var j=function(){return!b.model.gameOver&&b.model.joined&&f.turn()===b.model.color.charAt(0)},k=function(){var a=!b.model.gameOver&&b.model.isInTurn;b.model.panelClass=a?b.model.voted?"panel-success":"panel-info":"panel-default"};e.forward("game-over",b),b.$on("socket:game-over",function(a,c){b.model.gameOver=c.gameOver,b.model.isInTurn=!1,b.model.voted=!1,b.model.vote=null,k()}),e.forward("new-top-rated-game-move",b),b.$on("socket:new-top-rated-game-move",function(a,c){console.log("[debug] socket:new-top-rated-move: "+JSON.stringify(c)),b.model.gameOver=c.gameOver,f.loadPgn(c.pgn),b.board.position(c.fen),b.model.gameHistoryString=f.pgn(),b.model.turn=f.turn(),b.model.isInTurn=j(),b.model.vote=null,b.model.voted=!1;var d=c.move;if(d){var e="b"===d.color?"black":"white";Messenger().post({message:e+" agreed on "+d.san+(d.__debug_random?" (r) ":""),type:"info",showCloseButton:!0,hideAfter:3})}k()}),b.voteForResignation=function(){if(b.model.joined&&!b.model.voted){var a="b"===f.turn()?"black":"white",c={token:g,turn:a,resign:!0,move:{san:"resign"}};e.emit("new-move",c),i(c),k()}},e.on("player-resigned",function(a){console.log("[debug] player-resigned: "+JSON.stringify(a))}),e.on("player-connected",function(a){console.log("[debug] player-connected: "+JSON.stringify(a))}),e.on("player-disconnected",function(a){console.log("[debug] player-disconnected: "+JSON.stringify(a))}),e.on("joined-room",function(a){console.log("[debug] joined-room: "+JSON.stringify(a))}),e.on("left-room",function(a){console.log("[debug] left-room: "+JSON.stringify(a))}),e.on("room-max-capacity-reached",function(){}),e.forward("self-joined-room",b),b.$on("socket:self-joined-room",function(a,c){console.log("[debug] socket:self-joined-room: "+JSON.stringify(c)),e.emit("player-connect",{token:g}),b.$on("$destroy",function(){console.log("[debug] emit player-disconnect"),e.emit("player-disconnect",{token:g})})}),console.log("[debug] emit join-room"),e.emit("join-room",{token:g}),b.$on("$destroy",function(){console.log("[debug] emit leave-room"),e.emit("leave-room",{token:g})}),b.$on("chesshive:vote-for-suggested-move",function(a,b){h(b.color,b.san,b.source,b.target)})}]),angular.module("chesshiveApp").controller("AboutCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("chesshiveApp").run(["$templateCache",function(a){a.put("views/about.html",'<div class="jumbotron"> <img src="images/chesspieces/wikipedia/bK.png" alt="I\'m a black king"> <h1>{{body.appName}}</h1> <p class="lead"> Always a pleasure providing realtime chess games. </p> </div> <blockquote> <p> The most powerful weapon in chess is to have the next move. </p> <footer>David Bronstein in <cite title="Source Title">Source Title</cite></footer> </blockquote>'),a.put("views/main.html",'<div class="jumbotron"> <img src="images/chesspieces/wikipedia/bK.png" alt="I\'m a black king"> <h1>{{body.appName}}</h1> <p class="lead"> {{body.appName}} is a Massive Multiplayer Online Chess Game </p> <p> <a class="btn btn-lg btn-success" ng-href="#/play"> Let me play <i class="fa fa-check"></i> </a> </p> </div>'),a.put("views/play.html",'<div class="" data-ng-controller="HiveChessGameCtrl"> <!--div class="row">\n    <div class="col-xs-12">\n      <div class="alert alert-info alert-dismissible" role="alert">\n        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span\n          aria-hidden="true">&times;</span></button>\n        <strong>Multiplayer game!</strong> This game follows normal chess rules with the addition\n        that multiple players have to agree on a move before taking the final decision. Every team\n        has 30 seconds for each move - the most suggested one will be selected.\n      </div>\n    </div>\n  </div--> <div class="row"> <div class="col-xs-12 col-sm-8 col-md-7"> <div id="board-panel" class="panel {{model.panelClass}}"> <div class="panel-heading"> <p style="margin-top:13px; position:relative; overflow: hidden" data-ng-switch data-on="model.turn"> <span class="animate-switch" data-ng-switch-when="w"> <img src="images/chesspieces/wikipedia/wK.png" style="height:32px; margin-top:-7px" alt="White king"> <strong>white</strong> to move <span class="label animate-show-hide" style="margin-left: 0.5em" data-ng-class="{ \'label-success\': model.voted, \'label-primary\': !model.voted }" data-ng-show="model.isInTurn"> <span data-ng-show="model.voted">vote accepted</span> <span data-ng-show="!model.voted">make your move</span> </span> </span> <span class="animate-switch" data-ng-switch-when="b"> <img src="images/chesspieces/wikipedia/bK.png" style="height:32px; margin-top:-7px" alt="Black king"> <strong>black</strong> to move <span class="label animate-show-hide" style="margin-left: 0.5em" data-ng-class="{ \'label-success\': model.voted, \'label-primary\': !model.voted }" data-ng-show="model.isInTurn"> <span data-ng-show="model.voted">vote accepted</span> <span data-ng-show="!model.voted">make your move</span> </span> </span> <span class="pull-right" style="font-size: 2em; line-height: 0.8em" data-chesshive-time-to-next-digest data-show-progress-bar="false" data-show-text="true"></span> </p> </div> <div data-chesshive-time-to-next-digest data-show-progress-bar="true" data-show-text="false"></div> <div class="panel-body"> <div class="col-xs-offset-0 col-xs-12 col-sm-offset-0 col-sm-12"> <div data-nywton-chessboard data-board="board" on-drag-start-cb="onDragStart" on-drop="onDrop" on-snap-end="onSnapEnd" data-nywton-chessboard-autoresize></div> <div class="caption text-center"> </div> </div> </div> <div class="panel-footer"> <div class="btn-group" role="group"> <button type="button" class="btn btn-default btn-sm" data-ng-click="board.orientation(\'flip\')"> <i class="fa fa-exchange fa-rotate-90"></i> <span class="sr-only">Flip Board</span> </button> </div> <div class="btn-group pull-right" role="group"> <button id="resignButton" type="button" class="btn btn-warning center-block btn-sm" data-ng-click="voteForResignation()" data-ng-show="model.isInTurn" data-ng-disabled="model.voted">Resign </button> </div> </div> </div> </div> <div class="col-xs-12 col-sm-4 col-md-5" data-ng-show="model.gameOver"> <div data-chesshive-game-over-message></div> </div> <div class="col-xs-12 col-sm-4 col-md-5" data-ng-show="!model.gameOver"> <div class="panel {{model.panelClass}}"> <div class="panel-heading"> <p style="margin-top:13px"> <img data-ng-src="{{model.pieceImageSrc}}" style="height:32px; margin-top:-7px" alt="Your color"> You are in team <strong>{{model.orientation}}</strong> </p> </div> <div class="panel-body"> <p id="player-stats"> <span data-chesshive-player-stats></span> </p> <p id="vote-stats" data-ng-show="model.isInTurn"> <span data-chesshive-suggested-moves data-is-in-turn="model.isInTurn"></span> </p> <p data-ng-show="!model.isInTurn"> Wait till your opponents agree on a move. </p> </div> <div class="panel-footer"> <a data-ng-click="model.showGameHistory = !model.showGameHistory" data-ng-switch data-on="model.showGameHistory"> <span data-ng-switch-default>Show</span> <span data-ng-switch-when="true">Hide</span> History </a> </div> </div> </div> <div class="col-xs-12 col-md-12 animate-show-hide" data-ng-show="model.showGameHistory"> <div class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title">Moves Made</h4> </div> <div class="panel-body"> <textarea rows="6" id="pgn" class="form-control" readonly data-ng-model="model.gameHistoryString">\n        </textarea> </div> <div class="panel-footer"> </div> </div> </div> </div> </div>')}]);