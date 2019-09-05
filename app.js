const dummyData = require('./dummy-data')
const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response){
  const model = {
    humans: dummyData.humans,
    pets : dummyData.pets
  }
  response.render("show-all-humans.hbs", model)
})

app.get('/home', function(request, response){
  response.render("home.hbs")
})
app.get('/blog', function(request, response){
  response.render("blog.hbs")
})
app.get('/guestbook', function(request, response){
  response.render("guestbook.hbs")
})
app.get('/about', function(request, response){
  response.render("about.hbs")
})
app.get('/contact', function(request, response){
  response.render("contact.hbs")
})

app.listen(8080)