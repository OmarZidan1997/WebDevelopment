const dummyData = require('./dummy-data')
const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
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
app.get('/blog', function(request, response){
  response.render("blog.hbs",{ title:"Blog Page" })
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