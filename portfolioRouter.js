const express = require('express')
const db = require('./db')

const router = express.Router()


router.get("/", function (request, response) {

    db.getAllProjects(function (error, project) {

        if (error) {
            const model = {
                somethingWentWrong: true
            }
            response.render("portfolio.hbs", model)
        }
        else {
            const model = {
                project,
                somethingWentWrong: false
            }
            response.render("portfolio.hbs", model)
        }
    })
})

//** create project**//
router.post('/', function (request, response) {

    if (request.session.isLoggedIn) {
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
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "Couldn't create portfolio project , please contact the support"
                    }
                    response.render("view-errors.hbs", model)
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
    }
    else {
        response.redirect("/login")
    }
})


router.get('/create-project', function (request, response) {

    if (request.session.isLoggedIn) {
        response.render("create-portfolio-project.hbs")
    }
    else {
        response.redirect("/login")
    }
})


router.get("/project/:id", function (request, response) {

    const projectId = parseInt(request.params.id)

    db.getPortfolioProjectById(projectId, function (error, project) {
        
        if (error) {
            const model = {
                error: true,
                errorType: "error 500! Internal server error",
                errorDescription: "Couldn't fetch data for that project in the database , please contact the support"
            }
            response.render("view-errors.hbs", model)
        }
        else {
            const model = {
                somethingWentWrong: false,
                project
            }
            response.render("portfolio-project.hbs", model)
        }
    })

})

router.post('/project/:id/delete', function (request, response) {
    
    if (request.session.isLoggedIn) {

        const id = parseInt(request.params.id)
        db.deleteProjectById(id, function (error) {
            
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't delete project something is wrong in the database , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {

                response.redirect("/portfolio")

            }
        })
    }
    else {
        response.redirect("/login")
    }

})


router.get('/search-project', function (request, response) {

    const projectsToSearch = request.query.searchInput
    db.searchForProjects(projectsToSearch, function (error, project) {
        if (error) {
            const model = {
                error: true,
                errorType: "error 500! Internal server error",
                errorDescription: "Couldn't search in project, please contact the support"
            }
            response.render("view-errors.hbs", model)
        }
        else {
            const model = {
                somethingWentWrong: false,
                project
            }
            response.render("portfolio.hbs", model)
        }
    })
})

module.exports = router