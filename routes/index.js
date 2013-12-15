/*
 * GET home page.
 */
"use strict";
var forms = require('../js/forms');
var genders = ['male','female','other'];
var subject_options=[
	{key:"tech",value:"tech"},{key:"politics",value:"politics"}
];
var RegistrationForm=function(){
	var registrationForm = forms.form.createFormBuilder();
	registrationForm.add('text','username',{attributes:{required:true}});
	registrationForm.add('text','password',{attributes:{required:true}});
	registrationForm.add('select','gender',{choices:genders,attributes:{required:true}});
	registrationForm.add('checkbox','tos',{label:"agree to TOS",attributes:{required:true,checked:"checked"}});
	registrationForm.add('submit','submit',{attributes:{value:'submit'}});
	return registrationForm;
}


exports.index = function(req, res){
  res.render('index',{form:new RegistrationForm});
};