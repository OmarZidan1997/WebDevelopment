const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const blogRouter = require('./blogRouters')
const guestbookRouter = require('./guestbookRouter')
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


//-----------------------------//
app.use("/blog",blogRouter)
//------------------------------//


//------------------------------//
app.use("/guestbook",guestbookRouter)
//------------------------------//


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