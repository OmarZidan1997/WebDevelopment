const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const db = require('./db')

const app = express()

app.engine("hbs", expressHandlebars({
  defaultLayout: "main.hbs"
}))

app.use(bodyParser.urlencoded({
  extended: false
}))


app.use(express.static('public'));



app.get('/', function (request, response) {
  response.render("home.hbs", { title: "Home Page" })
})



//        blog section          //

// Get all posts
app.get('/blog', function (request, response) {
  db.getAllBlogPosts(function (error, blogPosts) {
    var model = {}
    if(error){
      model = {
        somethingWentWrong: true
      }
    } else {
     model = {
       blogPosts: blogPosts,
       somethingWentWrong: false
     }
    }
    response.render("blog.hbs", model)
  })
})
// Create a blog post 
app.post("/blog", function (request, response) {

  const title = request.body.title
  const content = request.body.content
  
  var model = {}
  const validationErrors = []

  if (title == ""){
    validationErrors.push("Must enter title")
  }
  if (content == ""){
    validationErrors.push("Must Enter content")
  }

  if (validationErrors.length == 0) {

    db.createBlogPost(title,content, function(error,id){
      if(error){

        model = {
          somethingWentWrong: true,
        }

        response.render("create-blog-post.hbs",model)
      } 
      else{

        response.redirect("/blog/" + id)
      }

    })

  }
  else{
    model = {
      title,
      content,
      validationErrors
    }
    response.render("create-blog-post.hbs",model)
  }
})


// get create blog post form
app.get('/create-blog-post', function (request, response) {
  const model = {
    validationErrors: []
  }
  response.render("create-blog-post.hbs", model)
})


// get a specific blog post by ID
app.get("/blog/:id", function (request, response) {

  const id = parseInt(request.params.id) //converts the id from string to int
  var model = {}

  db.getBlogPostById(id,function(error,blogPost){
    if(error){
      model = {
        somethingWentWrong : true
      }
    }
    else{
      model = {
        somethingWentWrong: false,
        blogPost
      }
    }
    
    response.render("blog-post.hbs",model)
  })

})


// delete blog post by ID
app.post("/delete-blog-post/:id",function(request,response){

  const id = parseInt(request.params.id)

  db.deleteBlogPostById(id,function(error){
    response.redirect("/blog")
  })

})

// shows the form to edit a specific post 
app.get("/edit-blog-post/:id",function(request,response){

  const id = parseInt(request.params.id)
  var model = {}
  db.getBlogPostById(id,function(error,blogPost){
    if(error){

      model = {
        somethingWentWrong : true
      }

      response.render("edit-blog-post.hbs",model)
    }
    else{
      
      model = {
        somethingWentWrong : false,
        blogPost
      }

      response.render("edit-blog-post.hbs",model)
    }
    
  })

})

app.post("/edit-blog-post/:id", function(request,response){
  
  const id = parseInt(request.params.id)
  const title = request.body.title
  const content = request.body.content
  
  var model = {}
  const validationErrors = []

  if (title == ""){
    validationErrors.push("Must enter title")
  }
  if (content == ""){
    validationErrors.push("Must Enter content")
  }

  if (validationErrors.length == 0) {

    db.updateBlogPostById(title,content,id, function(error){
      if(error){
        model = {
          somethingWentWrong: true
        }
        response.render("create-blog-post.hbs",model)
      } else{
        response.redirect("/blog")
      }

    })
  }
  else{
    db.getBlogPostById(id,function(error,blogPost){ 
      if(error){

        model = {
          somethingWentWrong : true
        }

        response.render("edit-blog-post.hbs",model)
      }
      else{
        
        model = {
          somethingWentWrong : false,
          validationErrors,
          blogPost
        }

        response.render("edit-blog-post.hbs",model)
      }
      
    })
  }
})


// Blog section ends //
//-------------------//

//FAQ
app.get('/faq', function (request, response) {
  response.render("faq.hbs")
})

app.get('/portfolio', function (request, response) {
  response.render("portfolio.hbs")
})




app.get('/about', function (request, response) {
  response.render("about.hbs", { title: "About Page" })
})




app.get('/contact', function (request, response) {
  response.render("contact.hbs", { title: "Contact Page" })
})




app.listen(8080)