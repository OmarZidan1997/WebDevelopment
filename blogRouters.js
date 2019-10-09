const express = require('express')
const db = require('./db')

const router = express.Router()

// Get all posts

router.get('/create-blog-post', function (request, response) {

    if (request.session.isLoggedIn) {
        response.render("create-blog-post.hbs")
    }
    else {
        response.redirect("/login")
    }
})

router.get("/:pageNr", function (request, response) {

    var postPerPage = 4;
    var currentPage = parseInt(request.params.pageNr)
    var previousPage = currentPage
    var firstPage = 1
    var offset = postPerPage * (currentPage - firstPage)

    if (currentPage > firstPage) {
        previousPage--
    }
    else if (currentPage < firstPage) {
        return response.redirect("/blog/" + firstPage)
    }
    else {
        previousPage = 0;
    }


    db.getBlogPostsForEachPage(postPerPage, offset, function (blogPost, error) {

        if (error) {
            const model = {
                error: true,
                errorType: "error 500! Internal server error",
                errorDescription: "Blog page you are trying to visit doesnt exist please enter valid url"
            }
            response.render("view-errors.hbs", model)
        }
        else {
            var nrOfPagesInBlog;
            var nextPage = 0;
            const page = []
            if (blogPost.length > 0) {
                nrOfPagesInBlog = Math.ceil(blogPost[0].nrOfPosts / postPerPage)
                for (var i = 1; i <= nrOfPagesInBlog; i++) {
                    if (i == currentPage) {
                        page.push({ pageNr: i, isCurrentPage: true })
                    }
                    else {
                        page.push({ pageNr: i, isCurrentPage: false })
                    }
                }
                if (currentPage < nrOfPagesInBlog) {
                    nextPage = currentPage + 1
                }
            }
            const model = {

                blogPost,
                previousPage,
                nextPage,
                page,
                somethingWentWrong: false
            }
            response.render("blog.hbs", model)
        }

    })

})
// Create a blog post 
router.post("/", function (request, response) {

    if (request.session.isLoggedIn) {
        const title = request.body.title
        const content = request.body.content
        const validationErrors = []

        if (title == null || title.trim() == "") {
            validationErrors.push("Must enter title")
        }

        if (content == null || content.trim() == "") {
            validationErrors.push("Must Enter content")
        }

        if (validationErrors.length == 0) {
            var timePostAdded = new Date()
            timePostAdded = timePostAdded.toLocaleString()
            db.createBlogPost(title, content, timePostAdded, function (error, id) {
                if (error) {
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "The post you are trying to create was not successfully created in te database please contact the support"
                    }
                    response.render("view-errors.hbs", model)
                }
                else {

                    response.redirect("/blog/post/" + id)
                }
            })
        }
        else {
            const model = {
                title,
                content,
                validationErrors
            }
            response.render("create-blog-post.hbs", model)
        }
    }
    else {
        response.redirect("/login")
    }
})


// get a specific blog post and its comments 
router.get("/post/:id", function (request, response) {

    const id = parseInt(request.params.id) //converts the id from string to int
    db.getBlogPostAndCommentsById(id, function (error, blogPost) {
        if (error) {
            const model = {
                error: true,
                errorType: "error 500! Internal server error",
                errorDescription: "Couldnt fetch the blog post from the database , please contact the support"
            }
            response.render("view-errors.hbs", model)
        }
        else {
            const model = {
                somethingWentWrong: false,
                blogPost
            }
            response.render("blog-post.hbs", model)
        }
    })
})


// delete blog post by ID
router.post("/delete-blog-post/:id", function (request, response) {

    if (request.session.isLoggedIn) {
        const id = parseInt(request.params.id)

        db.deleteBlogPostById(id, function (error) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldnt delete the post , something is wrong with the database please the contact support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                response.redirect("/blog/1")
            }
        })
    }
    else {
        response.redirect("/login")
    }
})

// shows the form to edit a specific post 
router.get("/post/:id/edit", function (request, response) {

    if (request.session.isLoggedIn) {
        const id = parseInt(request.params.id)
        db.getBlogPostById(id, function (error, blogPost) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldnt fetch the blog post from the database, please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                const model = {
                    somethingWentWrong: false,
                    blogPost
                }
                response.render("edit-blog-post.hbs", model)
            }
        })
    }
    else {
        response.redirect("/login")
    }
})

router.post("/post/:id/edit", function (request, response) {

    if (request.session.isLoggedIn) {
        const blogPostId = parseInt(request.params.id)
        const blogPostTitle = request.body.title
        const blogPostContent = request.body.content
        const validationErrors = []

        if (blogPostTitle == null || blogPostTitle.trim() == "") {
            validationErrors.push("Must enter title")
        }
        if (blogPostContent == null || blogPostContent.trim() == "") {
            validationErrors.push("Must Enter content")
        }

        if (validationErrors.length == 0) {
            db.updateBlogPostById(blogPostTitle, blogPostContent, blogPostId, function (error) {
                if (error) {
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "Couldnt edit the post , please contact the support"
                    }
                    response.render("create-blog-post.hbs", model)
                } else {
                    response.redirect("/blog/1")
                }
            })
        }
        else {
            db.getBlogPostById(blogPostId, function (error, blogPost) {
                if (error) {
                    const model = {
                        error: true,
                        errorType: "error 500! Internal server error",
                        errorDescription: "Couldnt fetch the blog post from the database, please contact the support"
                    }
                    response.render("view-errors.hbs", model)
                }
                else {
                    const model = {
                        somethingWentWrong: false,
                        validationErrors,
                        blogPost
                    }
                    response.render("edit-blog-post.hbs", model)
                }
            })
        }
    }
    else {
        response.redirect("/login")
    }
})


router.post("/post/:id/createcomment", function (request, response) {

    const blogId = parseInt(request.params.id)
    const nameOfTheGuest = request.body.name
    const commentOfTheGuest = request.body.comment
    const validationErrors = []

    if (nameOfTheGuest == null || nameOfTheGuest.trim() == "") {
        validationErrors.push("Please enter name")
    }
    if (commentOfTheGuest == null || commentOfTheGuest.trim() == "") {
        validationErrors.push("Please enter comment")
    }

    if (validationErrors.length == 0) {
        db.createBlogPostComment(nameOfTheGuest, commentOfTheGuest, blogId, function (error) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldnt create comment for that post , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {

                response.redirect("/blog/post/" + blogId)
            }
        })
    }
    else {
        db.getBlogPostAndCommentsById(blogId, function (error, blogPost) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldnt fetch the blog post from the database, please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                const model = {
                    somethingWentWrong: false,
                    validationErrors,
                    blogPost,
                    name: nameOfTheGuest,
                    comment: commentOfTheGuest
                }
                response.render("blog-post.hbs", model)
            }
        })
    }

})


//deletes the guest's comment
router.post("/post/:id/deletecomment/:commentId", function (request, response) {
    if (request.session.isLoggedIn) {
        const commentId = parseInt(request.params.commentId)
        const blogId = parseInt(request.params.id)

        db.deleteBlogPostCommentById(commentId, function (error) {
            if (error) {
                const model = {
                    error: true,
                    errorType: "error 500! Internal server error",
                    errorDescription: "Couldn't delete comment in the blog post , please contact the support"
                }
                response.render("view-errors.hbs", model)
            }
            else {
                response.redirect("/blog/post/" + blogId)
            }
        })
    }
    else {
        response.redirect("/login")
    }
})



module.exports = router