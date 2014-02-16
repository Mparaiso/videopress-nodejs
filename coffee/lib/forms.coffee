form = require 'mpm.form'
forms = exports

###
    User SignUp
###
forms.SignUp = (csrf)->
    form.create('sign-up')
    .add('username',"text",{
            validators:form.validation.Required()
            attributes:{class:'form-control',required:true}}
    )
    .add('email',"email",{
            validators:form.validation.Email()
            attributes:{class:'form-control',required:true}}
    )
    .add('password',"repeated",{attributes:{class:'form-control',type:"password",required:true}})
    .add('_csrf','hidden',{default:csrf,attributes:{id:"_csrf"}})
    .add('submit','submit',{default:"submit"})
