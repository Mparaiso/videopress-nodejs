module.exports = (container)->
    container.set 'forms',container.share (c)->
        form = require 'mpm.form'
        _ = require 'lodash'
        forms = {}
        ###
            User SignUp
        ###
        forms.SignUp = (csrf)->
            form.create('sign_up')
            .add('username',"text",{validators:form.validation.Required(),attributes:{class:'form-control',required:true}})
            .add('email',"email",{validators:form.validation.Email(),attributes:{class:'form-control',required:true}})
            .add('password',"repeated",{attributes:{class:'form-control',type:"password",required:true}})
            .add('_csrf','hidden',{validators:form.validation.Required(),'default':csrf,attributes:{id:"_csrf"}})
            .add('submit','submit',{'default':"Sign Up"})
        ###
            Login Form
        ###
        forms.Login = (csrf)->
            form.create('login')
            .add('email','text',{validators:[form.validation.Required(),form.validation.Email()],attributes:{class:'form-control',required:true}})
            .add('password','password',{validators:form.validation.Required(),attributes:{class:'form-control',required:true}})
            .add('login','submit',{'default':"Login",attributes:{class:'btn'}})
            .add('_csrf','hidden',{'default':csrf,attributes:{id:'_csrf'}})
        
        ###
            Video Form
        ###
        forms.VideoCreate = (categories=[])->
            categories = categories.map (category)-> {key:category.title,value:category.id}
            form.create('video')
            .add('url','text',{validators:form.validation.Required(),attributes:{'required',class:'form-control'}})
            .add('category','select',{choices:categories,validators:form.validation.Required(),attributes:{'required',class:'form-control'}})

        forms.Video = (categories=[])->
            _categories = categories.map (category)-> {key:category.title,value:category.id}
            categoryTransform={
                from:(c)->if c then c.id 
                to:(id)->categories.filter((c)->c.id.toString() == id.toString() )[0]
            }
            form.create('video')
            .add('title','text',{validators:form.validation.Required(),attributes:{'required',class:'form-control'}})
            .add('category','select',{transform:categoryTransform,choices:_categories,validators:form.validation.Required(),attributes:{'required',class:'form-control'}})
            .add('description','textarea',{attributes:{class:'form-control',rows:10}})
        
        ###
            Playlist form
        ###
        forms.Playlist = ()->
            form.create('playlist')
            .add('title','text',{validators:form.validation.Required(),attributes:{required:true,class:'form-control'}})
            .add('description','textarea',{validators:form.validation.Required(),attributes:{rows:3,required:true,class:'form-control'}})
            .add('video_urls','textarea',{validators:form.validation.Required(),attributes:{class:'form-control',rows:10,required:true}})
            .add('help','label',{default:'Help Text',attributes:{class:'help-block',value:'Copy and paste multiple video urls in the videos field,separated by a space,comma or a line break.'}})
        
        
        return forms

