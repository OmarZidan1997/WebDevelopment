const express = require('express')
const db = require('./db')

const router = express.Router()


// get all guestbook comments
router.get('/', function (request, response) {

    db.getAllGuestbookComments(function (error, guestbook) {

        if (error) {
            response.render("error500.hbs")
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
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                response.redirect("/guestbook/")
            }
        })
    }
    else {
        db.getAllGuestbookComments(function (error, guestbook) {
            if (error) {
                response.render("error500.hbs")
            } else {
                const model = {
                    guestbook: guestbook,
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

        const guestbookCommentId = parseInt(request.params.id)

        db.getGuestbookCommentById(guestbookCommentId, function (error, guestbookComment) {
            if (error) {
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                if (guestbookComment) {
                    const model = {
                        guestbookComment
                    }
                    response.render("guestbook-reply.hbs", model)
                }
                else {
                    response.render("error404.hbs")
                }
            }
        })
    }
    else {
        response.redirect("/login")
    }
})

// reply a guest's comment
router.post("/comment/:id/reply", function (request, response) {

    if (request.session.isLoggedIn) {
        const guestbookCommentId = parseInt(request.params.id)
        const reply = request.body.reply
        const validationErrors = []

        if (reply == null || reply.trim() == "") {
            validationErrors.push("Must enter text")
        }

        if (validationErrors.length == 0) {
            db.createGuestbookReply(guestbookCommentId, reply, function (error) {
                if (error) {
                    // this will happen if the comment you are trying to reply is deleted while you are replying to it!
                    if (error.code == "SQLITE_CONSTRAINT") {
                        response.render("error404.hbs")
                    }
                    else {
                        console.log(error)
                        response.render("error500.hbs")
                    }
                }
                else {
                    response.redirect("/guestbook/")
                }
            })
        }
        else {
            db.getGuestbookCommentById(guestbookCommentId, function (error, guestbookComment) {
                if (error) {
                    console.log(error)
                    response.render("error500.hbs")
                }
                else {
                    if (guestbookComment) {
                        const model = {
                            guestbookComment,
                            validationErrors
                        }
                        response.render("guestbook-reply.hbs", model)
                    }
                    else {
                        response.render("error404.hbs")
                    }
                }
            })
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
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                if (reply) {
                    const model = {
                        somethingWentWrong: false,
                        guestbookId,
                        reply
                    }
                    response.render("edit-guestbook-reply.hbs", model)
                }
                else {
                    response.render("error404.hbs")
                }
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

            db.updateGuestbookReply(newReply, id, function (error, changes) {
                if (error) {
                    console.log(error)
                    response.render("error500.hbs")
                } else {
                    if (changes) {
                        response.redirect("/guestbook/")
                    }
                    else {
                        response.render("error404.hbs")
                    }
                }
            })
        }
        else {
            db.getGuestbookReplyById(id, function (error, reply) {
                if (error) {
                    console.log(error)
                    response.render("view-errors.hbs", model)
                }
                else {
                    if (reply) {
                        const model = {
                            somethingWentWrong: false,
                            validationErrors,
                            guestbookId: id,
                            reply
                        }
                        response.render("edit-guestbook-reply.hbs", model)
                    }
                    else {
                        response.render("error404.hbs")
                    }
                }
            })
        }
    }
})

router.post("/deleteReplyComment/:replyId", function (request, response) {

    if (request.session.isLoggedIn) {
        const replyId = parseInt(request.params.replyId)

        db.deleteGuestbookReplyById(replyId, function (error, changes) {
            if (error) {
                console.log(error)
                response.render("error500.hbs", model)
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
                console.log(error)
                response.render("error500.hbs", model)
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