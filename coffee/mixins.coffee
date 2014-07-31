###
    Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.
###
mixins = exports
###
    route map mixin
    mount routes with a single object
    @param routes
    @param prefix
###
mixins.map = (routes, prefix = "")->
    for key,value of routes
        # console.log(prefix,key,value)
        switch typeof value
            when "object"
                if value instanceof Array #value is an array of functions
                    value.unshift(prefix)
                    this[key].apply(this,value)
                else this.map(value, prefix + key) #value is a hash of value definitions
            else
                this[key].apply(this,[prefix,value]) # value is a function , key is a verb or use
    return this

###
helper function for app.param
register multiple param at the same time
@param {Array.<{name:String,callback:Function}>} params an map of params
###
mixins.params = (params={})->
    this.param(param.name,param.callback) for param in params
    return this
