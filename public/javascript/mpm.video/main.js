/*global angular */
"use strict";
var app = angular.module("mpm.video", []);
app.factory("VideoService", function($http) {
	var VideoService = {
		getVideos: function() {
			return $http({
				method: 'GET',
				url: '/api/video'
			});
		}
	};
	return VideoService;
});
app.controller("VideoController", function($scope, VideoService) {
	VideoService.getVideos().success(function(data) {
		$scope.videos = data;
	});
});