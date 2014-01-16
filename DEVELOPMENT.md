(IN FRENCH ONLY)
----------------

API

<code>
GET    /
GET    /video : list videos
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
</code>
