/*jslint node:true,eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
"use strict";
var c=require('./app');
var _=require('underscore');
var q=require('q');
var res;
/**
 * push each category into its corresponding video 
 */
var cb=function(){console.log(arguments);res=arguments;};
q.when(c.Video.find().exec())
.then(function(videos){
    return [videos,c.Category.find().exec()];
})
.spread(function(videos,categories){
    return _.map(videos,function(vid){
        return q.ninvoke(_.extend(vid,{category:_.find(categories,function(cat){
            return cat.originalId==vid.categoryId;})}
                                 ),'save');
    });
})
.spread(function  (result) {
    console.log("success",arguments);
    process.exit(0);
},function(err){
    console.log('error',arguments);
    process.exit(1);
});

