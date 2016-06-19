(function() {
	var app = angular.module("enron", []).factory(
			'DataService',
			[
					'$http',
					function($http) {
						function unwrapHistoryQuestions(data) {
							console.log("data retrieved: " + data);
							var questions = [];
							for (var i = 0; i < data.data.length; i++) {
								questions.push(data.data[i]);
							}
							console.log(questions);
							return questions;
						}

						function addHistoryQuestion(newQuestion) {
							var req = { method : 'POST', url : '/enron/api/history_questions/',
								headers : { 'Content-Type' : 'application/json' }, data : newQuestion };

							$http(req).then(function() {
								console.log("Question inserted!");
							});
						}

						return { getHistoryQuestions : function() {
							// return
							// $http.get('/enron/api/historyquestions/?format=json').then(unwrapHistoryQuestions);
							return $http.get('/enron/api/history_questions').then(unwrapHistoryQuestions);
						}, addHistoryQuestion : addHistoryQuestion };
					} ]);

	app.config(function($interpolateProvider) {
		$interpolateProvider.startSymbol('[[[');
		$interpolateProvider.endSymbol(']]]');
	});

	console.log("app.js is loaded.");

	app.service('answerService', function() {
		this.answers = [];

		this.setAnswers = function(newObj) {
			for (var i = 0; i < newObj.length; i++) {
				this.answers[i] = newObj[i];
			}
		};

		this.getAnswers = function() {
			return this.answers;
		};
	});

	app.controller("Question", [ "DataService", "$http", "answerService",
			function(DataService, $http, answerService) {
				this.questionText = "";
				this.submitQuestion = function() {
					console.log("QuestionText: " + this.questionText);
					$http.get("http://jsonplaceholder.typicode.com/posts").success(function(data) {
						console.log("return " + data.length + " answers with the first being " + data[0].id);
						answerService.setAnswers(data);
					});

					var newQuestion = { question : this.questionText };
					DataService.addHistoryQuestion(newQuestion);

					this.questionText = "";
				};
			} ]);

	app.controller("Answer", [ "$scope", "answerService", function($scope, answerService) {
		this.answers = answerService.getAnswers();
		this.thumbsUp = new Array(6);
		this.thumbsDown = new Array(6);
		for (var i = 0; i < 6; ++i) {
			this.thumbsUp[i] = false;
			this.thumbsDown[i] = false;
		}

		this.thumbsUp = function(answerID) {
			console.log("Thumbs up for answer {" + answerID + "}.")
			this.thumbsUp[answerID] = !this.thumbsUp[answerID];
			this.thumbsDown[answerID] = false;
		};

		this.thumbsDown = function(answerID) {
			console.log("Thumbs down for answer {" + answerID + "}.")
			this.thumbsDown[answerID] = !this.thumbsDown[answerID];
			this.thumbsUp[answerID] = false;
		};

	} ]);

	app.controller("History", [ "$scope", "DataService", function($scope, DataService) {
		DataService.getHistoryQuestions().then(function(historyQuestions) {
			$scope.historyQuestions = historyQuestions;
			console.log("History questions: " + $scope.historyQuestions);
		});
	} ]);
})();