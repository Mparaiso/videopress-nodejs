var config ={
	youtube_api_key:process.env.EXPRESS_VIDEO_YOUTUBE_API_KEY,
	mongodb_connection_string:process.env.EXPRESS_VIDEO_MONGODB_CONNECTION_STRING,
	db:{
		debug:false
	}
};

if(process.env.NODE_ENV==="development"){
	// configure app for development
	config.youtube_api_key = "AIzaSyD5S112lV4mlTQPeWrT-gTZWOQoQhzR8O4";
	config.mongodb_connection_string="mongodb://camus:defender@dharma.mongohq.com:10007/express-video";
	config.db.debug=true;
}

module.exports = config;