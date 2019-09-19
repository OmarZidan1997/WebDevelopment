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
  const model = {
    humans: dummyData.humans,
    pets: dummyData.pets
  }
  response.render("show-all-humans.hbs", model)
})



app.get('/home', function (request, response) {
  response.render("home.hbs", { title: "Home Page" })
})



//        blog section          //

// Get all posts
app.get('/blog', function (request, response) {
  db.getAllBlogPosts(function (error, blogPosts) {
    var model = {}
    if(error){
      model = {
        error: error
      }
    } else {
     model = {
       blogPosts: blogPosts
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

  if (title == "")
    validationErrors.push("Must enter title")
  if (title.length <= 10)
    validationErrors.push("Please enter more than 10 letters in the title field")
  if (content == "")
    validationErrors.push("Must Enter content")
  if (content.length <= 50)
    validationErrors.push("Must enter content with more than 50 letters in the content field")

  if (validationErrors.length == 0) {
    db.createBlogPost(title,content, function(error,id){
      if(error){
        model = {
          error,
          title,
          content
        }
        response.render("create-blog-post.hbs",model)
      } else{
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


// show a specific blog post
app.get('/create-blog-post', function (request, response) {
  const model = {
    validationErrors: []
  }
  response.render("create-blog-post.hbs", model)
})



app.get("/blog/:id", function (request, response) {

  const id = parseInt(request.params.id) //converts the id from string to int
  var model = {}
  db.getBlogPostById(id,function(error,blogPost){
    if(error){
      model = {
        error: error
      }
      response.render("blog-post.hbs",model)
    }
    else{
      model = {
        blogPost: blogPost
      }
      response.render("blog-post.hbs",model)
    }
  })

})


app.get('/guestbook', function (request, response) {
  response.render("guestbook.hbs", { title: "GuestBook Page" })
})




app.get('/about', function (request, response) {
  response.render("about.hbs", { title: "About Page" })
})




app.get('/contact', function (request, response) {
  response.render("contact.hbs", { title: "Contact Page" })
})




app.listen(8080)