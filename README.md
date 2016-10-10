# LiveQA and EnronQA GUI

## Description
This project is the GUI to the LiveQA system built by Di and a Solr index of the e-mails that form the Enron corpus. The site was built under the Bootstrap framework for the views, which requires Django and Angular JS. 


## Structure
The project structure is as follows:

- enron_oaqa
	- enron 
		- views.py
		- ...
	- enron_oaqa
		- static
			- enron
				- app.js
				- ...
	- static/enron
	- db.sqlite3
	- launch.sh
	- manaage.py

The queries to the LiveQA service along with the querying to the Solr index occurs under enron/views::get_answers. The server information needs to be decoupled from the actual code and moved to a configuration file, with all its respective changes.

## Usage
The sever can be launched by calling the ```launch.sh``` script. By default it will run the webapp in the port 8000. This script calls the ```manage.py``` script which is the default launch script by Django.

## Interface 

The Interface is composed by three main components: the history bar on the left, the search box alongside its button and the search result panes. Since we are using AngularJS, the full interface behavior is programmed within the Javascript file ```enron_oaqa/static/enron/app.js```.

The strucutre of the ```app.js``` file is as follows:

- **Factories:**
	- sharedMessageService : this helps pass messages between controllers to update themselves
- **Services:**
	- DataService : Manages the history of the last N questions asked add and load
	- answerService : Manages the display of the retrieved questions
	- questionService : Manages the POST of a question comming from the Question controller
- **Controllers:**
	- Question : Takes care of the events launched by the searchbox and search button
	- Answer : Manages the thumbs up/down event from the answer panes
	- History : Manages the update of the history pane according to what is stored in the database and the recently asked question
- **Directives:**
	- loading : In charge of showing the loading animation
	- clickAndDisable : In charge of disabling the question controllers while another query is in process

