form = require 'mpm.form'
forms = exports

###
    User SignUp
###
forms.SignUp = (csrf)->
    form.create('sign_up')
    .add('username',"text",{validators:form.validation.Required(),attributes:{class:'form-control',required:true}})
    .add('email',"email",{validators:form.validation.Email(),attributes:{class:'form-control',required:true}})
    .add('password',"repeated",{attributes:{class:'form-control',type:"password",required:true}})
    .add('_csrf','hidden',{'default':csrf,attributes:{id:"_csrf"}})
    .add('submit','submit',{'default':"Sign Up"})
###
    Login Form
###
forms.Login = (csrf)->
    form.create('login')
    .add('email','text',{validators:form.validation.Required(),attributes:{class:'form-control',required:true}})
    .add('password','password',{validators:form.validation.Required(),attributes:{class:'form-control',required:true}})
    .add('login','submit',{'default':"Login",attributes:{class:'btn'}})
    .add('_csrf','hidden',{'default':csrf,attributes:{id:'_csrf'}})

###
    Video Form
###
forms.Video = (csrf)->
    form.create('video')
    .add('title','text',{validators:form.validation.Required(),attributes:{'required',class:'form-control'}})
    .add('private','checkbox',{value:true,attributes:{class:''}})
    .add('description','textarea',{attributes:{class:'form-control',rows:10}})
    .add('_csrf','hidden',{'default':csrf,attributes:{id:'_csrf'}})
