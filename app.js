const dummyData = require('./dummy-data')
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
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



// blog section //
app.get('/blog', function (request, response) {
  const model = {
    blog_posts: dummyData.blog_posts
  }
  response.render("blog.hbs", model)
})



app.get('/create-blog-post', function (request, response) {
  const model = {
    validationErrors: []
  }
  response.render("create-blog-post.hbs", model)
})



app.get("/blog/:id", function (request, response) {

  const id = parseInt(request.params.id) //converts the id from string to int

  const blog_post = dummyData.blog_posts.find(b => b.id == id)

  const model = {
    blog_post
  }

  response.render("blog-post.hbs", model)
})



app.post("/create-blog-post", function (request, response) {

  const title = request.body.title
  const content = request.body.content

  const validationErrors = []

  if (title == "") {
    validationErrors.push("Must enter title")
  }

  if(title.length <= 10){
    validationErrors.push("Please enter more than 10 letters in the title field")
  }
  if (content == "") {
    validationErrors.push("Must Enter content")
  }

  if(content.length <= 50 ){
    validationErrors.push("Must enter content with more than 50 letters in the content field")
  }

  if (validationErrors.length == 0) {

    const blog_post_entry = {
      id: dummyData.blog_posts.length + 1,
      title,
      content
    }

    dummyData.blog_posts.push(blog_post_entry)

    response.redirect("/blog/" + blog_post_entry.id)

  }
  else{

    const model = {
      validationErrors,
      title,
      content
    }

    response.render("create-blog-post.hbs",model)

  }

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