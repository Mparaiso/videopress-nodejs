/*jslint node:true,white:true*/
module.exports = {
	/**
	 * local template variables
	 */
	locals:require('./locals')
	/**
	 * application models
	 */
	, models:require('./models')
	/**
	 * configuration
	 */
	, config:require('./config')
	, providers:require('./providers')
	, duration:require('./duration')
};