/*jslint nomen:true,white:true,node:true,es5:true*/
/*global require,it,describe,beforeEach */
/**
 *  MOCHA TEST for express video
 */
 "use strict";
 require('chai').should();
 var assert = require('assert')
 , lib = require('../lib');

  describe('DURATION',function(){
    var valid_durations = ["P1Y","P10Y5M","P5Y105D","P10Y5M3DT6H9M10S","PT10H7M10.9S","P10YT99.99S"]
    , invalid_durations=["5","P10S","P10Y6D5M"];

    
    valid_durations.forEach(function(duration){
        it("parses duration "+duration,function(){
         assert.doesNotThrow(function(){
            lib.duration.parse(duration);
        });
     });
    });
    invalid_durations.forEach(function(duration){
        it("throws an error on invalid duration : "+duration,function(){
          assert.throws(function(){
            lib.duration.parse(duration);
        });
      });
    });
    it('should return the correct duration object',function(){
        var duration1 = lib.duration.parse("P1Y")
        , duration2 = lib.duration.parse('P10Y5M3DT6H9M10S');
        
        assert.equal(duration1.years,1);
        assert.equal(duration1.days,0);

        assert.equal(duration2.years,10);
        assert.equal(duration2.months,5);
        assert.equal(duration2.days,3);
        assert.equal(duration2.hours,6);
        assert.equal(duration2.minutes,9);
        assert.equal(duration2.seconds,10);
    });
});
