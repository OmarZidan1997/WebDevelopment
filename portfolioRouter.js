const express = require('express')
const db = require('./db')

const router = express.Router()


router.get("/", function (request, response) {
    db.getAllProjectsIdAndTitle(function (error, projectIdAndTitle) {
        var model = {}
        if (error) {
            model = {
                somethingWentWrong: true
            }
        }
        else {
            model = {
                projectIdAndTitle,
                somethingWentWrong: false
            }
        }
        response.render("portfolio.hbs", model)
    })
})

//** create project**//
router.post('/', function (request, response) {

    const projectTitle = request.body.title
    const projectContent = request.body.content
    const validationErrors = []

    if (projectTitle == null || projectTitle.trim() == "") {
        validationErrors.push("Must enter title")
    }

    if (projectContent == null || projectContent.trim() == "") {
        validationErrors.push("Must Enter content")
    }

    if (validationErrors.length == 0) {
        db.createPortfolioProject(projectTitle, projectContent, function (error, id) {
            if (error) {
                // do something with error 
            }
            else {

                response.redirect("/portfolio/project/" + id)
            }
        })
    }
    else {

        const model = {
            somethingWentWrong: false,
            validationErrors,
            projectTitle,
            projectContent
        }
        response.render("create-portfolio-project.hbs", model)
    }
})


router.get('/createproject', function (request, response) {
    response.render("create-portfolio-project.hbs")
})


router.get("/project/:id", function (request, response) {

    const projectId = parseInt(request.params.id)
    var model = {}
    db.getPortfolioProjectById(projectId, function (error, project) {
        if (error) {
            model = {
                somethingWentWrong: true
            }

            response.render("portfolio-project.hbs", model)
        }
        else {

            model = {
                somethingWentWrong: false,
                project
            }

            response.render("portfolio-project.hbs", model)
        }
    })

})




module.exports = router