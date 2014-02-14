mpm.video
=========

author : mparaiso

Express-video is a cms allowing users to create playlists from various video web sites such as Youtube. It is built on nodejs with express framework and mongodb.

### DOCUMENTATION

#### API 

	GET    / : homepage
	GET    /video : display a video
	GET    /video?q=search%20terms
	GET    /video/new : new video form
	POST   /video/new : post new video
	GET    /video/(?P<id>\d+) : get video
	GET    /video/edit/(?P<id>\d+) : edit video form
	POST   /video/edit/(?P<id>\d+) : put video
	DELETE /video/(?P<id>\d+) : delete video
	GET    /playlist : list playlists
	GET    /playlist/new : new playlist form
	POST   /playlist/new : post new playlist
	GET    /playlist/edit/(?P<id>\d+) : show playlist
	POST   /playlist/edit/(?P<id>\d+) : post playlist

