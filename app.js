const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const blogRouter = require('./blogRouters')
const guestbookRouter = require('./guestbookRouter')
const portfolioRouter = require('./portfolioRouter')
const expressSession = require("express-session")
const SQLiteStore = require('connect-sqlite3')(expressSession)
var bcrypt = require('bcryptjs')
var csrf = require('csurf')
const db = require('./db')



const app = express()

const usernameOfAdmin = "admin"
var passwordOfAdmin

bcrypt.genSalt(10, function (error, salt) {
    bcrypt.hash("AdMin123", salt, function (error, hash) {
        passwordOfAdmin = hash
    })
})


app.use(expressSession({
    secret: 'What Comes Around Goes Around',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore()
}))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(csrf());

app.use(function (request, response, next) {
    response.locals.csrfToken = request.csrfToken()
    next()
})
// add information if admin logged in or not
app.use(function (request, response, next) {
    response.locals.isLoggedIn = request.session.isLoggedIn
    next()
})

app.engine("hbs", expressHandlebars({
    defaultLayout: "main.hbs",
}))

app.use(express.static('public'));


app.get('/', function (request, response) {
    response.render("home.hbs", { title: "Home Page" })
})


//-----------------------------//
app.use("/blog", blogRouter)
//------------------------------//


//------------------------------//
app.use("/guestbook", guestbookRouter)
//------------------------------//

//------------------------------//
app.use("/portfolio", portfolioRouter)
//------------------------------//






app.get('/about', function (request, response) {
    response.render("about.hbs", { title: "About Page" })
})




app.get('/contact', function (request, response) {
    response.render("contact.hbs", { title: "Contact Page" })
})

app.get('/login', function (request, response) {
    if (!request.session.isLoggedIn) {
        response.render("login.hbs")
    }
    else {
        response.redirect("/")
    }

})
app.post('/login', function (request, response) {
    if (!request.session.isLoggedIn) {

        const usernameEntered = request.body.username
        const passwordEntered = request.body.password
        const validationErrors = []

        if (usernameEntered == null || usernameEntered.trim() == "") {

            validationErrors.push("Must enter username")
        }

        if (passwordEntered == null || passwordEntered.trim() == "") {

            validationErrors.push("Must enter password")
        }

        if (usernameEntered != usernameOfAdmin && validationErrors.length == 0) {

            validationErrors.push("details entered is wrong!")
        }

        if (validationErrors.length == 0) {

            bcrypt.compare(passwordEntered, passwordOfAdmin, function (error, result) {

                if (error) {
                    const model = {
                        errorType: "Error with the login",
                        errorDescription: "Couldn't  proceed with login, please contact me!"
                    }
                    response.render("view-errors.hbs", model)
                }
                else if (result == true) {

                    request.session.isLoggedIn = true
                    response.redirect("/")
                }
                else {

                    validationErrors.push("details entered is wrong!")
                    const model = {
                        validationErrors,
                        usernameEntered,
                        passwordEntered
                    }
                    response.render("login.hbs", model)
                }
            });
        }
        else {

            const model = {
                validationErrors,
                usernameEntered,
                passwordEntered
            }
            response.render("login.hbs", model)
        }
    }
    else {
        response.redirect("/")
    }
})

app.get('/logout', function (request, response) {
    if (request.session.isLoggedIn) {
        // delete session object
        request.session.destroy(function (error) {
            if (error) {
                const model = {
                    errorType: "Error with logging out",
                    errorDescription: "Please contact me!"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                response.redirect("/")
            }
        });
    }
    else {
        response.redirect("/")
    }
})

// this will view page not found if user try to cange the url that didnt match wih the routers.
app.get("/*", function (request, response) {
    response.render("error404.hbs")
})
app.post("/*", function (request, response) {
    response.render("error404.hbs")
})


app.listen(8080)