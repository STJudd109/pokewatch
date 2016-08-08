'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'ngMaterial',
  'ngMessages',
  'ngGeolocation', 
  'uiGmapgoogle-maps', 
  'firebase'
]);



app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

app.config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default').primaryPalette('red').dark();
});