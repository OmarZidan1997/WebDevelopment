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

app.get('/', function(request, response){
  const model = {
    humans: dummyData.humans,
    pets : dummyData.pets
  }
  response.render("show-all-humans.hbs", model)
})



app.get('/home', function(request, response){
  response.render("home.hbs",{ title:"Home Page" })
})



// blog section //
app.get('/blog', function(request, response){
  const model = {
    blog_posts: dummyData.blog_posts
  }
  response.render("blog.hbs",model)
})



app.get('/create-blog-post', function(request, response){
  response.render("create-blog-post.hbs")
})



app.get("/blog/:id", function(request, response){
  const id = request.params.id

  const blog_post = dummyData.blog_posts.find(b => b.id == id)

  const model = {
    blog_post
  }

  response.render("blog-post.hbs",model)
})



app.post("/create-blog-post",function(request,response){
  const title = request.body.title
  const content = request.body.content

  const blog_post_entry = {
    id: dummyData.blog_posts.length + 1,
    title,
    content
  }

  dummyData.blog_posts.push(blog_post_entry)

  response.redirect("/blog/"+blog_post_entry.id)
  
})




app.get('/guestbook', function(request, response){
  response.render("guestbook.hbs",{ title:"GuestBook Page" })
})




app.get('/about', function(request, response){
  response.render("about.hbs",{ title:"About Page" })
})




app.get('/contact', function(request, response){
  response.render("contact.hbs",{ title:"Contact Page" })
})




app.listen(8080)