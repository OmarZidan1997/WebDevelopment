const express = require('express')
const db = require('./db')

const router = express.Router()


// get all guestbook comments
router.get('/', function (request, response) {
    db.getAllGuestbookComments(function (error, guestbook) {
        if (error) {
            const model = {
                error: true,
                errorType: "error 500! Internal server error",
                errorDescription: "Couldn't delete comment in the guestbook , please contact the support"
            }
            response.render("view-errors.hbs", model)
        } else {
            const model = {
                guestbook: guestbook,
                somethingWentWrong: false
            }
            response.render("guestbook.hbs", model)
        }
    })
})

// create guestbook comment
router.post('/', function (request, response) {
    const name = request.body.name
    const message = request.body.message
    const validationErrors = []
    if (name == null || name.trim() == "") {
        validationErrors.push("Must enter title")
    }

    if (message == null || message.trim() == "") {
        validationErrors.push("Must Enter content")
    }

    if (validationErrors.length == 0) {
        db.createGuestbookComment(name, message, function (error) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't create comment in the guestbook , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                response.redirect("/guestbook/")
            }
        })
    }
    else {
        db.getAllGuestbookComments(function (error, guestbook) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't fetch data required for guestbook page , please contact the support"
                }
                response.render("view-errors.hbs", model)
            } else {
                const model = {
                    guestbook: guestbook,
                    somethingWentWrong: false,
                    validationErrors,
                    name,
                    message
                }
                response.render("guestbook.hbs", model)
            }
        })
    }
})


//gets reply form
router.get("/comment/:id/reply", function (request, response) {
    if (request.session.isLoggedIn) {
        const guestbookId = parseInt(request.params.id);
        const model = { guestbookId }
        response.render("guestbook-reply.hbs", model)
    }
    else {
        response.redirect("/login")
    }
})

// answer a guest's comment
router.post("/comment/:id/reply", function (request, response) {
    if (request.session.isLoggedIn) {
        const guestbookId = parseInt(request.params.id)
        const reply = request.body.reply
        const validationErrors = []

        if (reply == null || reply.trim() == "") {
            validationErrors.push("Must enter text")
        }

        if (validationErrors.length == 0) {
            db.createGuestbookReply(guestbookId, reply, function (error) {
                if (error) {
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "Couldn't create guestbook reply for a specific comment, please contact the support"
                    }
                    response.render("view-errors.hbs", model)
                }
                else {
                    response.redirect("/guestbook/")
                }
            })
        }
        else {
            const model = {
                somethingWentWrong: false,
                guestbookId,
                reply,
                validationErrors
            }
            response.render("guestbook-reply.hbs", model)
        }

    }
    else {
        response.redirect("/login")
    }

})

router.get("/comment/:id/editReply", function (request, response) {

    if (request.session.isLoggedIn) {
        const guestbookId = parseInt(request.params.id);
        db.getGuestbookReplyById(guestbookId, function (error, reply) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't fetch data from the database to get a guestbook reply , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                const model = {
                    somethingWentWrong: false,
                    guestbookId,
                    reply
                }
                response.render("edit-guestbook-reply.hbs", model)
            }
        })
    }
    else {
        response.redirect("/login")
    }

})

router.post("/comment/:id/editReply", function (request, response) {
    if (request.session.isLoggedIn) {

        const id = parseInt(request.params.id)
        const newReply = request.body.reply
        const validationErrors = []

        if (newReply == null || newReply.trim() == "") {
            validationErrors.push("Must enter message")
        }

        if (validationErrors.length == 0) {

            db.updateGuestbookReply(newReply, id, function (error) {
                if (error) {
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "Couldn't edit a guestbook reply , please contact the support"
                    }
                    response.render("view-errors.hbs", model)
                } else {
                    response.redirect("/guestbook/")
                }
            })
        }
        else {
            db.getGuestbookReplyById(id, function (error, reply) {
                if (error) {
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "Couldn't fetch data required to edit a guestbook reply , please contact the support"
                    }
                    response.render("view-errors.hbs", model)
                }
                else {

                    const model = {
                        somethingWentWrong: false,
                        validationErrors,
                        guestbookId: id,
                        reply
                    }
                    response.render("edit-guestbook-reply.hbs", model)
                }
            })
        }
    }
})

router.post("/deleteReplyComment/:replyId", function (request, response) {

    if (request.session.isLoggedIn) {

        const replyId = parseInt(request.params.replyId)

        db.deleteGuestbookReplyById(replyId, function (error) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't delete guestbook reply  , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {

                response.redirect("/guestbook/")
            }

        })
    }
    else {
        response.redirect("/login")
    }

})


// delete comment from guestbook
router.post("/comment/:id/delete", function (request, response) {

    if (request.session.isLoggedIn) {

        const id = parseInt(request.params.id)

        db.deleteCommentFromGuestbook(id, function (error) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't delete comment from guestbook  , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                response.redirect("/guestbook/")
            }
        })

    }
    else {
        response.redirect("/login")
    }
})

module.exports = router