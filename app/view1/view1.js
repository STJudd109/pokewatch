'use strict';

angular.module('myApp.view1', ['ngRoute', 'ngMaterial', 'ngMessages', 'ngGeolocation', 'uiGmapgoogle-maps', 'firebase'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view1', {
		templateUrl: 'view1/view1.html',
		controller: 'View1Ctrl'
	});
}])

.factory("Auth", ["$firebaseAuth",
	function($firebaseAuth) {
		return $firebaseAuth();
	}
])

.controller('View1Ctrl', ['$scope', '$geolocation', '$firebaseArray', '$firebaseObject', 'Auth', '$mdToast', '$mdSidenav', '$mdDialog', function($scope, $geolocation, $firebaseArray, $firebaseObject, Auth, $mdToast, $mdSidenav, $mdDialog) {

	$scope.auth = Auth;

	$scope.auth.$onAuthStateChanged(function(firebaseUser) {
		$scope.firebaseUser = firebaseUser;
		console.log(firebaseUser);
		if (firebaseUser) {
			$scope.showSimpleToast("Signed in as: " + firebaseUser.displayName);
			var proref = firebase.database().ref().child('users/' + firebaseUser.uid);
			var prof = $firebaseObject(proref);
			prof.$loaded().then(function() {
				if (prof.team) {

					console.log("profile exists");
					$scope.profile = prof;
					console.log($scope.profile);
					console.log($scope.profile.team);

				} else {
					proref.set({
						'totalLogged': 0,
						'upvotes': 0,
						'downvotes': 0,
						'team': "no team",
						'desc': "just started as a trainer"
					});
					$scope.profile = prof;
				}

			});

		}

	});

	$scope.locupdate = 
		$geolocation.getCurrentPosition({
		enableHighAccuracy: true
	}).then(function(res) {
		console.log(res);
		$scope.map.center.latitude = res.coords.latitude;
		$scope.map.center.longitude = res.coords.longitude;
		$scope.map.zoom = 17;
		$scope.map.refresh = true;
		$scope.circles[0].center = $scope.map.center;
		$scope.circles[0].visible = true;
		$scope.circles[1].center = $scope.map.center;
		$scope.circles[1].visible = true;
		$scope.circles[2].center = $scope.map.center;
		$scope.circles[2].visible = true;
		$scope.loc = {
			latitude: res.coords.latitude,
			longitude: res.coords.longitude
		};
	});

	$geolocation.watchPosition({
		timeout: 50000,
		maximumAge: 250,
		enableHighAccuracy: true
	})

	var ref = firebase.database().ref().child('/pokemon');
	var markers = $firebaseArray(ref);

	markers.$loaded().then(function() {
		$scope.markers = markers;
		console.log($scope.markers);

	});

	var dexref = firebase.database().ref().child('/pokedex/');
	var dex = $firebaseArray(dexref);
	dex.$loaded().then(function() {
		$scope.pokemon = dex;

	});

	$scope.marks = [];

	$scope.map = {
		center: {
			latitude: 0,
			longitude: 0
		},
		zoom: 0,
		options: {
			clickableIcons: false,
			streetViewControl: false,
			mapTypeControl: false,
			zoomControl: false
		},
		refresh: false,
		mark: {icon: {
			url: "img/player.png",
			size: {height:7,width:7}
		}
		}
	};

	$scope.circles = [{
		id: 1,
		center: {
			latitude: 0,
			longitude: 0
		},
		radius: 15,
		stroke: {
			color: '#08B21F',
			weight: 2,
			opacity: 0.3
		},
		fill: {
			color: '#08B21F',
			opacity: 0.2
		},
		geodesic: true, // optional: defaults to false
		visible: false, // optional: defaults to true
		control: {}

	}, {
		id: 2,
		center: {
			latitude: 0,
			longitude: 0
		},
		radius: 35,
		stroke: {
			color: '#a0c7dc',
			weight: 2,
			opacity: 1
		},
		fill: {
			color: '#a0c7dc',
			opacity: 0.3
		},
		geodesic: true, // optional: defaults to false
		visible: false, // optional: defaults to true
		control: {}
	}, {
		id: 3,
		center: {
			latitude: 0,
			longitude: 0
		},
		radius: 50,
		stroke: {
			color: '#e15050',
			weight: 2,
			opacity: 0.4
		},
		fill: {
			color: '#e15050',
			opacity: 0.1
		},
		geodesic: true, // optional: defaults to false
		visible: false, // optional: defaults to true
		control: {}
	}];



	$scope.$on('$geolocation.position.changed', function(event, res) {
		console.log(res); //This is the current position
		$scope.loc = {latitude:res.coords.latitude,longitude:res.coords.longitude};
		$scope.circles[0].center = $scope.loc;
		$scope.circles[0].visible = true;
		$scope.circles[1].center = $scope.loc;
		$scope.circles[1].visible = true;
		$scope.circles[2].center = $scope.loc;
		$scope.circles[2].visible = true;
	});

	$scope.login = function() {
		if ($scope.firebaseUser) {
			$scope.auth.$signOut();
			$scope.firebaseUser = null;
			$scope.profile = null;
			$scope.showSimpleToast("signed out");
		} else {
			$scope.auth.$signInWithRedirect("google").then(function() {
				// Never called because of page redirect
			}).catch(function(error) {
				console.error("Authentication failed:", error);
			})
		}
	};

	$scope.locate = function(id) {
		// $scope.map.center.latitude = $geolocation.position.coords.latitude;
		// $scope.map.center.longitude = $geolocation.position.coords.longitude;

		$scope.map.center = $scope.loc;
		var ref = firebase.database().ref().child('/pokemon');
		var newref = ref.child('/' + id);
		var test = $firebaseArray(newref);
		test.$loaded().then(function() {
			// angular.forEach(test, function(data){
			// 	$scope.markers.push(data); 

			// });
			$scope.marks = test;
			console.log($scope.marks);
		});

	};

	$scope.vision = function() {

		var email = $mdDialog.prompt()
			.title('UserName')
			.textContent('for Pokemon go')
			.placeholder($scope.profile.pogodata.email)
			.ariaLabel('team name')
			.ok('Okay!')
			.cancel('nevermind');

		var password = $mdDialog.prompt()
			.title('password')
			.textContent('for Pokemon go')
			.placeholder('this doesnt get stored')
			.ariaLabel('login')
			.ok('Update')
			.cancel('cancel');

		$mdDialog.show(email).then(function(emailres) {
			$scope.pogoemail = emailres;
			// $scope.profile.$save();
			// $scope.showSimpleToast('changed to ' + result);
			$mdDialog.show(password).then(function(passres) {
				$scope.pogopass = passres;
				// $scope.profile.$save();
				// $scope.showSimpleToast('changed to ' + result);
						$.post("http://104.154.237.255/api/account" ,{"username" : $scope.pogoemail, "password" : $scope.pogopass, loc: $scope.loc, auth: 'google' }).then(function(data){
						console.log(data);
						// $.post("https://www.torkoal.com/api/fetch/profile" ,{ "auth": "google", "token" : data.data}).then(function(profile){
						// 	console.log(profile.data);
							$scope.account = data;
							$scope.account.email = $scope.pogoemail;
						var proref = firebase.database().ref().child('users/' + $scope.firebaseUser.uid + '/pogodata');
						proref.set($scope.account);
						// });
						$scope.showSimpleToast('Updated');
					});
			}, function() {
				$scope.showSimpleToast('Not updated');
			});
		}, function() {
			$scope.showSimpleToast('Not updated');
		});
	};


	$scope.centerMap = function() {
		// $scope.map.center.latitude = $geolocation.position.coords.latitude;
		// $scope.map.center.longitude = $geolocation.position.coords.longitude;
		console.log($scope.map.center);
		$scope.map.zoom = 17;
		$scope.map.center = $scope.loc;
		
		console.log($scope.loc);
		console.log($scope.map.center);
		console.log('fired centerMap');
	};

	$scope.getNear = function() {

		// $scope.map.center = $scope.loc;
		var ref = firebase.database().ref().child('/pokemon/');
		var arr = $firebaseArray(ref);

		// $scope.markers = [];
		$scope.marks = [];

		arr.$loaded()
			.then(function() {
				var test = [];
				angular.forEach(arr, function(item) {
						angular.forEach(item, function(pokemon) {
							if (pokemon !== null && typeof pokemon === 'object') {
								test.push(pokemon);
							}
							//console.log(pokemon);
						})
					})
					// console.log($scope.markers);
				$scope.marks = test;

			});

	};

	$scope.test = function(res) {
		// var contentString = '<p>'+ marker.id +' </p>';
		// $scope.infowindow = new google.maps.InfoWindow({
		//         content: contentString
		//       });
		//       $scope.infowindow.open();
		// $scope.showSimpleToast(e);
		console.log(res.model);

		$scope.showActionToast(res.model);

	};

	$scope.pokeInfo = function(name) {
		console.log(name);

		$mdDialog.show({
				controller: DialogController,
				templateUrl: 'dialog1.tmpl.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true,
				fullscreen: "false",
				pokemon: name
			})
			.then(function(answer) {
				console.log('You said the information was "' + answer + '".');
				
				if (answer == 'locate') {
					$scope.toggleListClose();
					$scope.locate(parseInt(name["Number"])); 
				}
				if (answer == 'found') {
					$scope.toggleListClose();
					$mdDialog.show({
						controller: modController,
						templateUrl: 'dialog3.tmpl.html',
						parent: angular.element(document.body),
						clickOutsideToClose: false,
						data: {},

					})
					.then(function(res) {
						console.log('You said the information was "' + res + '".');
						var mods = [];
						var com = 'none';
						if(res.lured == true){
							mods.push('Lured');
						}
						if(res.incense == true){
							mods.push('Incense');
						}
						if(res.wild == true){
							mods.push('Wild');
						}
						if(res.event == true){
							mods.push('Event');
						}
						// if(res.comment != null){
						// 	com = res.comment;
						// }
						$scope.mark(parseInt(name["Number"]),mods,com);

					});
					// $scope.mark(parseInt(name["Number"]));
				}
				if (answer == 'calc') {
					$mdDialog.show({
						controller: DialogController,
						templateUrl: 'dialog4.tmpl.html',
						parent: angular.element(document.body),
						clickOutsideToClose: true,
						fullscreen: false,
						pokemon: name,

					})
					.then(function(res) {
						// console.log('You said the information was "' + res + '".');
						// var mods = [];
						// if(res.lured == true){
						// 	mods.push('Lured');
						// }
						// if(res.incense == true){
						// 	mods.push('Incense');
						// }
						// if(res.wild == true){
						// 	mods.push('Wild');
						// }
						// if(res.event == true){
						// 	mods.push('Event');
						// }
						// $scope.mark(parseInt(name["Number"]),mods);

					});
				}

			}, function() {
				console.log('clicked Out of dialog');
			});

	};

	$scope.mark = function(id,mods,com) {
		console.log(id);

		$.get('https://pokeapi.co/api/v2/pokemon/' + id + '/').then(function(data) {
			$scope.currentPokemon = data;
			// alert(data.name + " was seen at: " + $scope.lat + " , " + $scope.long);
			//add firebase insert location

			var tempref = firebase.database().ref().child('/pokemon/' + id + '/');
			var tempinsert = $firebaseArray(tempref);
			var username = $scope.profile.pogodata.username;
			tempinsert.$loaded().then(function() {
				$scope.tempinsert = tempinsert;
				console.log($scope.tempinsert.length);

				if($scope.profile.pogodata.username == undefined) {
					var username = $scope.firebaseUser.displayName;
				}else if( $scope.profile.pogodata.username != undefined) {
					var username = $scope.profile.pogodata.username
				}else {
					var username = "Anon";
				}



				$scope.tempinsert.$add({
					id: ($scope.currentPokemon.name + $scope.tempinsert.length),
					coords: {
						latitude: $scope.loc.latitude,
						longitude: $scope.loc.longitude
					},
					options: {
						icon: 'img/larger-icons/' + id + '.png',
						title: $scope.pokemon[id - 1].Name,
						animation: google.maps.Animation.DROP
					},
					madeBy: username,
					user_id: $scope.firebaseUser.uid,
					pokemonNum: id,
					vote: 0,
					createdAt: new Date().getTime(),
					mods: mods,
					initialcom: "no comment"
				}).then(function() {
					$scope.showSimpleToast("a " + $scope.pokemon[id - 1].Name + ' has been inserted!');
					$scope.profile.totalLogged++;
					$scope.profile.$save().then(function() {
						console.log('updated logged count: ' + $scope.profile.totalLogged);

					});
					$scope.locate(id);

				});
			});

		});
	};

	// var markOff() = $scope.mark;

	$scope.showSimpleToast = function(msg) {
		$mdToast.show(
			$mdToast.simple()
			.textContent(msg)
			.hideDelay(3000)
		);
	};

	$scope.showActionToast = function(pokemon) {
		var toast = $mdToast.simple()
			.textContent(pokemon.options.title + " by: " + pokemon.madeBy + ' - rated: ' + pokemon.vote)
			.hideDelay(5000)
			.action('Options')
			.highlightAction(true)
			.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.

		$mdToast.show(toast).then(function(response) {
			if (response == 'ok') {
				// alert('You clicked the \'UNDO\' action.');
				//      var ref = firebase.database().ref().child('/pokemon/'+(pokemon.pokemonNum));
				// $scope.temparr = $firebaseArray(ref);
				// $scope.list = $firebaseArray(firebase.database().ref().child('/pokemon/'+pokemon.pokemonNum));
				// console.log($scope.list[pokemon]);

				// $scope.markers.$remove($scope.markers[id]);
				$mdDialog.show({
						controller: DialogController,
						templateUrl: 'dialog2.tmpl.html',
						parent: angular.element(document.body),
						clickOutsideToClose: true,
						pokemon: pokemon
					})
					.then(function(answer) {
						console.log('You said the information was "' + answer + '".');
						// $scope.toggleListClose();
						if (answer == 'up') {
							// $scope.locate(parseInt(name["Number"]));
							$scope.vote(1, pokemon);
							console.log('up voted');
							$scope.getNear();
						}
						if (answer == 'down') {
							// $scope.mark(parseInt(name["Number"]));
							$scope.vote(0, pokemon);
							console.log('down voted');
							$scope.getNear();
						}
						if (answer == 'del') {
							// $scope.mark(parseInt(name["Number"]));
							if ($scope.firebaseUser.uid == pokemon.user_id){
								$scope.vote(2, pokemon);
								console.log('deleted');
							}else {
								$scope.showSimpleToast("Prof. Oak: You can't use that here!");
							}
							$scope.getNear();
						}
						if (answer == 'com') {
							// $scope.mark(parseInt(name["Number"]));
							if ($scope.firebaseUser.uid == pokemon.user_id){
								$scope.vote(3, pokemon);
								console.log('comment added');
							}else {
								$scope.showSimpleToast("Prof. Oak: You can't use that here!");
							}
							$scope.getNear();
						}

					}, function() {
						console.log('clicked Out of dialog');
					});

			}
		});
	};

	$scope.vote = function(num, pokemon) {
		console.log('this' + num);

		// var fix = firebase.database().ref().child('pokemon/');
		// var pokefix = $firebaseArray(fix);
		// pokefix.$loaded().then(function(){
		// 	angular.forEach(pokefix, function(value, key) {
		// 		var obj1 = pokefix[key];
		// 		console.log("object 1: ");
		// 		console.log(obj1);
		// 		angular.forEach(obj1, function(value, key) {
		// 		var obj2 = obj1[key];
		// 		console.log("--object "+key+": ");
		// 		console.log(obj2);
		// 		}).then(function(){
		// 		console.log('Done with: '+ key);
		// 	});

		// 	}).then(function(){
		// 		console.log('Done with all');
		// 	});

		// });

		var objref = firebase.database().ref().child('pokemon/' + pokemon.pokemonNum);
		var voteref = $firebaseObject(objref);
		var userprof = firebase.database().ref().child('users/' + pokemon.user_id);
		var userprofile = $firebaseObject(userprof);
		var obj;
		var objkey;
		voteref.$loaded().then(function() {
			angular.forEach(voteref, function(value, key) {
				// console.log(key, value);
				if (voteref[key].id == pokemon.id) {
					obj = voteref[key];
					objkey = key;
					console.log(objkey);

				} else {

				}
			});
			// console.log(voteref);
			// console.log(voteref[pokemon.id]);
			if (num == 1) {
				if (obj.vote == undefined){
					obj.vote = 0;
				}
				userprofile.upvotes++;
				obj.vote++;

			} else if (num == 0) {
				if (obj.vote == undefined){
					obj.vote = 0;
				}
				userprofile.upvotes--;
				obj.vote--;

			} else if (num == 2) {
				voteref[objkey] = null;
			}
			userprofile.$save().then(function() {
				console.log('upvoted profile');
			});
			voteref.$save().then(function(){
				console.log('saved');
			});

		});

	};

	$scope.toggleListLeft = function() {
		$mdSidenav('left').toggle();
		$mdSidenav('right').close();
	};
	$scope.toggleListRight = function() {
		$mdSidenav('right').toggle();
		$mdSidenav('left').close();
	};

	$scope.toggleListClose = function() {
		$mdSidenav('right').close();
		$mdSidenav('left').close();
	};

	$scope.teamChange = function() {
		// Appending dialog to document.body to cover sidenav in docs app
		var email = $mdDialog.prompt()
			.title('User Name')
			.textContent('for Pokemon go')
			.placeholder('email@test.com')
			.ariaLabel('team name')
			.ok('Okay!')
			.cancel('nevermind');

		var password = $mdDialog.prompt()
			.title('password')
			.textContent('for Pokemon go')
			.placeholder('this doesnt get stored')
			.ariaLabel('team name')
			.ok('Okay!')
			.cancel('nevermind');

		$mdDialog.show(email).then(function(emailres) {
			$scope.pogoemail = emailres;
			// $scope.profile.$save();
			// $scope.showSimpleToast('changed to ' + result);
			$mdDialog.show(email).then(function(passres) {
				$scope.pogopass = passres;
				// $scope.profile.$save();
				// $scope.showSimpleToast('changed to ' + result);
			}, function() {
				$scope.showSimpleToast('Not updated');
			});
		}, function() {
			$scope.showSimpleToast('Not updated');
		});
	};

	$scope.profDesc = function() {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirms = $mdDialog.prompt()
			.title('Description')
			.textContent('What kinda trainer are you?')
			.placeholder('Ace Trainer')
			.ariaLabel('profile description')
			.ok('Okay!')
			.cancel('nevermind')

		$mdDialog.show(confirms).then(function(result) {
			$scope.profile.desc = result;
			$scope.profile.$save();
			$scope.showSimpleToast('changed to ' + result);
		}, function() {
			$scope.showSimpleToast('Desc hasnt changed');
		});
	};
// 	$scope.pokeindex =0;

// 	$scope.fixdata = function() {
// 			var data = 0;
// 			var dex2 = firebase.database().ref().child('pokedex/'+$scope.pokeindex+"/details/");
// 					dex2.set(data[$scope.pokeindex]).then(function() {
// 						console.log('saved ' + $scope.pokeindex);
// 					});
// 					$scope.pokeindex++;
// 			};

}]);

function DialogController($scope, $mdDialog, pokemon) {
	$scope.pokemonDetail = pokemon;
	$scope.date = Date($scope.pokemonDetail.createdAt);
	$scope.count = 0;
	$scope.outcp = "";
	$scope.incp = '0';
	$scope.hp = '';
	$scope.candy = '';
	$scope.lvlup = '';
	$scope.dust = [
	{dust:200, lvl:1},
	{dust:400, lvl:3},
	{dust:600, lvl:5},
	{dust:800, lvl:7},
	{dust:1000, lvl:9},
	{dust:1300, lvl:11},
	{dust:1600, lvl:13},
	{dust:1900, lvl:15},
	{dust:2200, lvl:17},
	{dust:2500, lvl:19},
	{dust:3000, lvl:21},
	{dust:3500, lvl:23},
	{dust:4000, lvl:25},
	{dust:4500, lvl:27},
	{dust:5000, lvl:29},
	{dust:6000, lvl:31},
	{dust:7000, lvl:33},
	{dust:8000, lvl:35},
	{dust:9000, lvl:37},
	{dust:10000, lvl:39}];

	$scope.hide = function() {
		$mdDialog.hide();
	};

	$scope.cancel = function() {
		$mdDialog.cancel();
	};

	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
	};
	$scope.calc = function() {
		// $mdDialog.hide(answer);
		var BaseAtk = $scope.pokemonDetail.details["Base Attack"];
		var BaseDef = $scope.pokemonDetail.details["Base Defense"];
		var BaseSta = $scope.pokemonDetail.details["Base Stamina"];
		console.log("clicked");
		$scope.count++;

		// $scope.outcp = (BaseAtk + 15) * Math.pow((BaseDef + 15),0.5) * Math.pow((BaseSta + 15),0.5) * Math.pow(0.790300,2) / 10;

		var stardust = [{dust:200, lvl:1},
		{dust:400, lvl:3},
		{dust:600, lvl:5},
		{dust:800, lvl:7},
		{dust:1000, lvl:9},
		{dust:1300, lvl:11},
		{dust:1600, lvl:13},
		{dust:1900, lvl:15},
		{dust:2200, lvl:17},
		{dust:2500, lvl:19},
		{dust:3000, lvl:21},
		{dust:3500, lvl:23},
		{dust:4000, lvl:25},
		{dust:4500, lvl:27},
		{dust:5000, lvl:29},
		{dust:6000, lvl:31},
		{dust:7000, lvl:33},
		{dust:8000, lvl:35},
		{dust:9000, lvl:37},
		{dust:10000, lvl:39}];

		$scope.dust = stardust;

		var multipliers = [{"lvl":1,"ecpm":0.0940000},
							{"lvl":1.5,"ecpm":0.1351374},
							{"lvl":2,"ecpm":0.1663979},
							{"lvl":2.5,"ecpm":0.1926509},
							{"lvl":3,"ecpm":0.2157325},
							{"lvl":3.5,"ecpm":0.2365727},
							{"lvl":4,"ecpm":0.2557201},
							{"lvl":4.5,"ecpm":0.2735304},
							{"lvl":5,"ecpm":0.2902499},
							{"lvl":5.5,"ecpm":0.3060574},
							{"lvl":6,"ecpm":0.3210876},
							{"lvl":6.5,"ecpm":0.3354450},
							{"lvl":7,"ecpm":0.3492127},
							{"lvl":7.5,"ecpm":0.3624578},
							{"lvl":8,"ecpm":0.3752356},
							{"lvl":8.5,"ecpm":0.3875924},
							{"lvl":9,"ecpm":0.3995673},
							{"lvl":9.5,"ecpm":0.4111936},
							{"lvl":10,"ecpm":0.4225000},
							{"lvl":10.5,"ecpm":0.4335117},
							{"lvl":11,"ecpm":0.4431076},
							{"lvl":11.5,"ecpm":0.4530600},
							{"lvl":12,"ecpm":0.4627984},
							{"lvl":12.5,"ecpm":0.4723361},
							{"lvl":13,"ecpm":0.4816850},
							{"lvl":13.5,"ecpm":0.4908558},
							{"lvl":14,"ecpm":0.4998584},
							{"lvl":14.5,"ecpm":0.5087018},
							{"lvl":15,"ecpm":0.5173940},
							{"lvl":15.5,"ecpm":0.5259425},
							{"lvl":16,"ecpm":0.5343543},
							{"lvl":16.5,"ecpm":0.5426358},
							{"lvl":17,"ecpm":0.5507927},
							{"lvl":17.5,"ecpm":0.5588306},
							{"lvl":18,"ecpm":0.5667545},
							{"lvl":18.5,"ecpm":0.5745692},
							{"lvl":19,"ecpm":0.5822789},
							{"lvl":19.5,"ecpm":0.5898879},
							{"lvl":20,"ecpm":0.5974000},
							{"lvl":20.5,"ecpm":0.6048188},
							{"lvl":21,"ecpm":0.6121573},
							{"lvl":21.5,"ecpm":0.6194041},
							{"lvl":22,"ecpm":0.6265671},
							{"lvl":22.5,"ecpm":0.6336492},
							{"lvl":23,"ecpm":0.6406530},
							{"lvl":23.5,"ecpm":0.6475810},
							{"lvl":24,"ecpm":0.6544356},
							{"lvl":24.5,"ecpm":0.6612193},
							{"lvl":25,"ecpm":0.6679340},
							{"lvl":25.5,"ecpm":0.6745819},
							{"lvl":26,"ecpm":0.6811649},
							{"lvl":26.5,"ecpm":0.6876849},
							{"lvl":27,"ecpm":0.6941437},
							{"lvl":27.5,"ecpm":0.7005429},
							{"lvl":28,"ecpm":0.7068842},
							{"lvl":28.5,"ecpm":0.7131691},
							{"lvl":29,"ecpm":0.7193991},
							{"lvl":29.5,"ecpm":0.7255756},
							{"lvl":30,"ecpm":0.7317000},
							{"lvl":30.5,"ecpm":0.7377735},
							{"lvl":31,"ecpm":0.7377695},
							{"lvl":31.5,"ecpm":0.7407856},
							{"lvl":32,"ecpm":0.7437894},
							{"lvl":32.5,"ecpm":0.7467812},
							{"lvl":33,"ecpm":0.7497610},
							{"lvl":33.5,"ecpm":0.7527291},
							{"lvl":34,"ecpm":0.7556855},
							{"lvl":34.5,"ecpm":0.7586304},
							{"lvl":35,"ecpm":0.7615638},
							{"lvl":35.5,"ecpm":0.7644861},
							{"lvl":36,"ecpm":0.7673972},
							{"lvl":36.5,"ecpm":0.7702973},
							{"lvl":37,"ecpm":0.7731865},
							{"lvl":37.5,"ecpm":0.7760650},
							{"lvl":38,"ecpm":0.7789328},
							{"lvl":38.5,"ecpm":0.7817901},
							{"lvl":39,"ecpm":0.7846370},
							{"lvl":39.5,"ecpm":0.7874736},
							{"lvl":40,"ecpm":0.7903000},
							{"lvl":40.5,"ecpm":0.7931164}];

		for(var i =0; i < stardust.length; i++) {
			if ($scope.candy == stardust[i].dust) {
				
					var level = (Number($scope.lvlup) + stardust[i].lvl);
				
				for(var o = 0; o < multipliers.length; o++){
					if(level == multipliers[o].lvl){
						var ecpm = multipliers[o].ecpm;
						break;
					}

				};
				break;
			}
		};



		// $scope.ecpm = Math.sqrt($scope.incp * 10 /(BaseAtk + 15) / Math.pow((BaseDef + 15),0.5) / Math.pow((BaseSta + 15),0.5));
		var maxiv = Math.floor((BaseAtk + 15) * Math.pow((BaseDef + 15),0.5) * Math.pow((BaseSta + 15),0.5) * Math.pow(ecpm,2) / 10);
		var miniv = Math.floor((BaseAtk + 0) * Math.pow((BaseDef + 0),0.5) * Math.pow((BaseSta + 0),0.5) * Math.pow(ecpm,2) / 10);
		console.log(maxiv);
		console.log(miniv);
		console.log($scope.incp);
		console.log(maxiv - $scope.incp);
		if(maxiv - $scope.incp < 0) {
			$scope.outcp = "has been powered up more this level, try again";
		} else {
			$scope.outcp = 100 - Math.floor(((maxiv - $scope.incp)/(maxiv - miniv))*100);
		}
	};
};

function modController($scope, $mdDialog, data) {
	$scope.data = data;
	$scope.hide = function() {
		$mdDialog.hide();
	};

	$scope.cancel = function() {
		$mdDialog.cancel();
	};

	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
	};
};


