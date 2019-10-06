const express = require('express')
const db = require('./db')

const router = express.Router()


// get all guestbook comments
router.get('/', function (request, response) {
    db.getAllGuestbookComments(function (error, guestbook) {

        var model = {}
        if (error) {
            model = {
                somethingWentWrong: true
            }
        } else {
            console.table(guestbook)
            model = {
                guestbook: guestbook,
                somethingWentWrong: false
            }
        }
        response.render("guestbook.hbs", model)
    })
})

// create guestbook comment
router.post('/', function (request, response) {

    const name = request.body.name
    const message = request.body.message
    var model = {}
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

                model = {
                    somethingWentWrong: true
                }
                response.render("guestbook.hbs", model)
            }
            else {

                response.redirect("/guestbook/")
            }
        })
    }
    else {
        db.getAllGuestbookComments(function (error, guestbook) {

            var model = {}
            if (error) {
                model = {
                    somethingWentWrong: true
                }
            } else {
                console.table(guestbook)
                model = {
                    guestbook: guestbook,
                    somethingWentWrong: false,
                    validationErrors,
                    name,
                    message
                }
            }
            response.render("guestbook.hbs", model)
        })
    }
})


//gets reply form
router.get("/comment/:id/reply", function (request, response) {
    const guestbookId = parseInt(request.params.id);
    const model = { guestbookId }
    response.render("guestbook-reply.hbs", model)
})


router.post("/comment/:id/reply", function (request, response) {
    const guestbookId = parseInt(request.params.id)
    const reply = request.body.reply
    var model = {}
    const validationErrors = []

    if (reply == null || reply.trim() == "") {
        validationErrors.push("Must enter text")
    }

    if (validationErrors.length == 0) {
        db.createGuestbookReply(guestbookId, reply, function (error) {
            if (error) {

                model = {
                    somethingWentWrong: true
                }
                response.render("guestbook-reply.hbs", model)
            }
            else {

                response.redirect("/guestbook/")
            }
        })
    }
    else {
        model = {
            somethingWentWrong: false,
            guestbookId,
            reply,
            validationErrors
        }
        response.render("guestbook-reply.hbs", model)
    }

})

router.get("/comment/:id/editReply", function (request, response) {
    const guestbookId = parseInt(request.params.id);
    var model = {}
    db.getGuestbookReplyById(guestbookId, function (error, reply) {
        if (error) {
            model = {
                somethingWentWrong: true
            }

            response.render("edit-guestbook-reply.hbs", model)
        }
        else {
            console.table(reply)
            model = {
                somethingWentWrong: false,
                guestbookId,
                reply
            }
            response.render("edit-guestbook-reply.hbs", model)
        }
    })

})

router.post("/comment/:id/editReply", function (request, response) {

    const id = parseInt(request.params.id)
    const newReply = request.body.reply

    var model = {}
    const validationErrors = []

    if (newReply == null || newReply.trim() == "") {
        validationErrors.push("Must enter message")
    }

    if (validationErrors.length == 0) {

        db.updateGuestbookReply(newReply, id, function (error) {
            if (error) {
                model = {
                    somethingWentWrong: true
                }
                response.render("edit-guestbook-reply.hbs", model)
            } else {
                response.redirect("/guestbook/")
            }

        })
    }
    else {
        db.getGuestbookReplyById(id, function (error, reply) {
            if (error) {
                model = {
                    somethingWentWrong: true
                }

                response.render("edit-guestbook-reply.hbs", model)
            }
            else {

                model = {
                    somethingWentWrong: false,
                    validationErrors,
                    guestbookId: id,
                    reply
                }
                response.render("edit-guestbook-reply.hbs", model)
            }
        })
    }
})

router.post("/deleteReplyComment/:replyId", function (request, response) {

    const replyId = parseInt(request.params.replyId)
  
    db.deleteGuestbookReplyById(replyId,function (error) {
      if (error) {

        //handle errors if couldnt delete reply
      }
      else {
  
        response.redirect("/guestbook/")
      }
  
    })
  
  })

  
// delete comment from guestbook
router.post("/comment/:id/delete", function (request, response) {

    const id = parseInt(request.params.id)

    db.deleteCommentFromGuestbook(id, function (error) {
        response.redirect("/guestbook/")
    })
})

module.exports = router