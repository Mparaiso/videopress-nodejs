videopress
=========

![principe](http://aikah.online.fr/cdn/videopress/principe.png)
![detail](http://aikah.online.fr/cdn/videopress/detail.png)

author : mparaiso

version : 0.0.3

###LIVE DEMO : http://videopress.herokuapp.com/

VIDEOPRESS is a cms allowing users to create playlists from various video web sites such as Youtube. 

It is built on nodejs with express framework and mongodb.

### Changelog

### FEATURES

- blazing fast thanks to nodejs

- mongodb backend

- membership

- import and display videos from : 
	- Youtube

- create playlists from various video hosting services

- rest api to create videos and playlists

### DOCUMENTATION

#### INSTALLATION

- install git http://git-scm.com/

- install nodejs and npm http://nodejs.org/

- intstall mongodb http://www.mongodb.org/

- get a youtube api key https://developers.google.com/youtube/v3/getting-started

- clone the repository with git

	git clone https://github.com/Mparaiso/mpm.video

- add the following envirronment variables to your system : 

	- EXPRESS_VIDEO_MONGODB_CONNECTION_STRING : your mongodb connection string
	  
	  on a local mongodb installation , should be  mongodb://localhost

	- EXPRESS_VIDEO_YOUTUBE_API_KEY : your youtube api key 

	- SESSION_SECRET : a secret phrase for session encryption

- open a terminal, go to the project folder

- install packages with the npm install command

- you should be good to go , just type : node app.js in the project folder

- open a web browser to http://localhost:300

- go to /signup to create a new account



	


#### API 

	GET		/ : homepage
	GET		/videoId : display a video

	user accounts

	/signup : signup
	/login :login
	/profile : profile
	/logout :logout

	### video management

	/profile/video :list user videos
	/profile/video/new :add new vide
	/profile/video/:videoId/update :update a video
	/profile/video/:videoId/delete :delete a video

#### Changelog

#### TODO

- [x] implement basic search of public videos
- [ ] secure api (PUT/POST/DELETE are disabled at the moment)
- [ ] make Video and Playlist models more strict
