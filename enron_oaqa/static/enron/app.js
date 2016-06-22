(function() {
	var app = angular.module("enron", []);

	app.service('DataService', [
			'$http',
			function($http) {
				this.questions = [];

				this.getHistoryQuestions = function() {
					var questions = this.questions;
					return $http.get('/enron/api/history_questions').then(function(data) {
						// console.log("data retrieved: " + data);
						for (var i = 0; i < data.data.length; i++) {
							questions.push(data.data[i]);
						}
						return questions;
					});
				};

				this.addHistoryQuestion = function(newQuestion) {
					var req = { method : 'POST', url : '/enron/api/history_questions/',
						headers : { 'Content-Type' : 'application/json' }, data : newQuestion };

					var questions = this.questions;
					$http(req).then(function() {
						console.log("Question inserted!");
						questions.unshift(newQuestion);
					});
				};
			} ]);

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

	app.service('questionService', ['$http', 'answerService', 'DataService', function($http, answerService, DataService) {
		this.submitQuestion = function(questionText) {
			var liveqaData = { 'qid' : '20130828153959AAtXAEs', 'title' : questionText,
					'body' : '', 'category' : '', };
				
				// Send request from client side.
				// var req = { method : 'POST', url :
				// 'http://gold.lti.cs.cmu.edu:18072/liveqa',
				// headers : { 'Content-type' : 'application/json', 'Accept' :
				// 'application/json' },
				// data : JSON.stringify(liveqaData) };

				var req = { method : 'POST', url : '/enron/api/get_answers/',
					headers : { 'Content-type' : 'application/json', 'Accept' : 'application/json' },
					data : JSON.stringify(liveqaData) };

				$http(req).success(
						function(data, status, headers, config) {
							console.log("Question submitted! Result is:");
							console.log(data);
							console.log(status);

							var answers = [];
							var returnedAnswers = data.answers.candidates;
							for (var i = 0; i < returnedAnswers.length; i++) {
								answers.push({ 'id' : i, 'source' : returnedAnswers[i].url,
									'score' : returnedAnswers[i].score, 'body' : returnedAnswers[i].bestAnswer });
							}
							console.log("answers: " + answers);
							answerService.setAnswers(answers);
							var newQuestion = { question : questionText };
							DataService.addHistoryQuestion(newQuestion);
						}).error(function(data, status, headers, config) {
					console.log("Question submission failed!");
					console.log(data);
					console.log(status);
				});
				// Testing code.
				// $http.get("http://jsonplaceholder.typicode.com/posts").success(function(data)
				// {
				// console.log("return " + data.length + " answers with the first
				// being " + data[0].id);
				// answerService.setAnswers(data);
				// });
		};
	}]);

	app.config(function($interpolateProvider) {
		$interpolateProvider.startSymbol('[[[');
		$interpolateProvider.endSymbol(']]]');
	});

	console.log("app.js is loaded.");

	app.controller("Question", [
			"DataService",
			"questionService",
			"answerService",
			function(DataService, questionService, answerService) {
				this.questionText = ""; // initial value;

				this.submitQuestion = function() {
					console.log("QuestionText: " + this.questionText);
					
					questionService.submitQuestion(this.questionText);

					// Zhong: keep the question text
					//this.questionText = "";
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

	app.controller("History", [ "$scope", "DataService", "questionService", function($scope, DataService, questionService) {
		DataService.getHistoryQuestions().then(function(historyQuestions) {
			$scope.historyQuestions = historyQuestions;
			// console.log("History questions: " + $scope.historyQuestions);
		});
		
//		$scope.$watch(function() { return Service.getNumber(); }, function(value) { $scope.number = value; });

		this.askQuestion = function(s) {
			questionService.submitQuestion(s);
		};
		
	} ]);
})();