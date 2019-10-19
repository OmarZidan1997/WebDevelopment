const express = require("express")
const db = require("./db")

const router = express.Router()


router.get("/", function (request, response) {

    db.getAllProjectsInPortfolio(function (error, projects) {

        if (error) {
            console.log(error)
            response.render("error500", model)
        }
        else {
            const model = {
                projects,
                searchValue: false
            }
            response.render("portfolio.hbs", model)
        }
    })
})

//** create project**//
router.post("/", function (request, response) {

    if (request.session.isLoggedIn) {
        const projectTitle = request.body.title
        const projectContent = request.body.content
        const validationErrors = []

        if (projectTitle == null || projectTitle.trim() == "") {
            validationErrors.push("Must enter title")
        }

        if (projectContent == null || projectContent.trim() == "") {
            validationErrors.push("Must enter content")
        }

        if (validationErrors.length == 0) {
            db.createPortfolioProject(projectTitle, projectContent, function (error, id) {
                if (error) {
                    console.log(error)
                    response.render("error500.hbs")
                }
                else {
                    response.redirect("/portfolio/project/" + id)
                }
            })
        }
        else {
            const model = {
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


router.get("/create-project", function (request, response) {

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
            console.log(error)
            response.render("error500.hbs", model)
        }
        else {
            if(project){
                const model = {
                    project
                }
                response.render("portfolio-project.hbs", model)
            }
            else{
                response.render("error404.hbs")
            }
        }
    })

})

router.post("/project/:id/delete", function (request, response) {
    
    if (request.session.isLoggedIn) {

        const projectId = parseInt(request.params.id)
        db.deleteProjectById(projectId, function (error) {
            
            if (error) {
                console.log(error)
                response.render("error500.hbs", model)
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


router.get("/search-project", function (request, response) {

    const projectsToSearch = request.query.searchInput
    db.searchForProjects(projectsToSearch, function (error, projects) {
        if (error) {
            console.log(error)
            response.render("error500.hbs", model)
        }
        else {
            const model = {
                projects,
                searchValue: projectsToSearch
            }
            response.render("portfolio.hbs", model)
        }
    })
})

module.exports = router 