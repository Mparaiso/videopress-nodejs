###
    Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.
###
module.exports = (container)->
    container.set 'validation', container.share ->
        validation = require 'mpm.validation'
        ###
            PlaylistUrl
        ###
        class PlaylistUrl extends validation.validators.Base

            constructor: (@_playlistParser)->
                super

            validateSync: (value)->
                if @_playlistParser.isValidUrl(value)
                    @setError(null)
                    return true
                else
                    @setError(new validation.ValidationError("url #{value} is not a valid playlist url"))
                    return

            validate: (value, callback)->
                console.log(arguments)
                if @_playlistParser.isValidUrl(value)
                    callback(null, true)
                else
                    @setError(new validation.ValidatorError("url #{value} is not a valid playlist url"))
                    callback(@getError())

        PlaylistUrl: (parser)->
            return new PlaylistUrl(parser)

