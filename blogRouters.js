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

// Create a blog post 
router.post("/create-blog-post", function (request, response) {

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
                    console.log(error)
                    response.render("error500.hbs")
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

router.get("/page/:pageNr", function (request, response) {

    var postPerPage = 4;
    var currentPage = parseInt(request.params.pageNr)
    var previousPage = currentPage
    var firstPage = 1
    var offset = postPerPage * (currentPage - firstPage)

    if (currentPage > firstPage) {
        previousPage--
    }
    else if (currentPage < firstPage) {
        return response.render("error404.hbs")
    }
    else {
        previousPage = 0;
    }


    db.getBlogPostsForEachPage(postPerPage, offset, function (blogPost, error) {
        if (error) {
            if (error.code == "SQLITE_MISMATCH") {
                response.render("error404.hbs")
            }
            else {
                console.log(error)
                response.render("error500.hbs")
            }
        }
        else {
            var nrOfPagesInBlog = 1;
            var nextPage = 0;
            const page = []
            if (blogPost.length) {
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
                const model = {
                    blogPost,
                    previousPage,
                    nextPage,
                    page
                }
                response.render("blog.hbs", model)
            }
            else if (!blogPost.length && currentPage > nrOfPagesInBlog) {
                response.render("error404.hbs")   // this will happen if user change url to blog page that doesnt exist
            }
            else {
                page.push({ pageNr: firstPage, isCurrentPage: true })
                const model = {
                    blogPost,
                    page
                }
                response.render("blog.hbs", model)
            }
        }

    })

})


// get a specific blog post and its comments 
router.get("/post/:id", function (request, response) {

    const id = parseInt(request.params.id) //converts the id from string to int

    db.getBlogPostAndCommentsById(id, function (error, blogPost) {
        if (error) {
            console.log(error)
            response.render("error500.hbs")
        }
        else {
            if (blogPost.length) {
                const model = {
                    blogPost
                }
                response.render("blog-post.hbs", model)
            }
            else {
                response.render("error404.hbs")
            }
        }
    })
})


// delete blog post by ID
router.post("/delete-blog-post/:id", function (request, response) {

    if (request.session.isLoggedIn) {
        const id = parseInt(request.params.id)
        const firstPage = 1

        db.deleteBlogPostById(id, function (error) {
            if (error) {
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                response.redirect("/blog/page/" + firstPage)
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
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                if (blogPost) {
                    const model = {
                        blogPost
                    }
                    response.render("edit-blog-post.hbs", model)
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
            db.updateBlogPostById(blogPostTitle, blogPostContent, blogPostId, function (error, changes) {
                if (error) {
                    console.log(error)
                    response.render("error500.hbs")
                }
                else {
                    if (changes) {
                        response.redirect("/blog/post/" + blogPostId)
                    }
                    else {
                        response.render("error404.hbs")
                    }
                }
            })
        }
        else {
            db.getBlogPostById(blogPostId, function (error, blogPost) {
                if (error) {
                    console.log(error)
                    response.render("error500.hbs")
                }
                else {
                    if (blogPost) {
                        const model = {
                            somethingWentWrong: false,
                            validationErrors,
                            blogPost
                        }
                        response.render("edit-blog-post.hbs", model)
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
                if (error.code == "SQLITE_CONSTRAINT") {

                    response.render("error404.hbs")
                }
                else {
                    console.log(error)
                    response.render("error500.hbs")
                }
            }
            else {
                response.redirect("/blog/post/" + blogId)
            }
        })
    }
    else {
        db.getBlogPostAndCommentsById(blogId, function (error, blogPost) {
            if (error) {
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                if (blogPost.length) {
                    const model = {
                        somethingWentWrong: false,
                        validationErrors,
                        blogPost,
                        name: nameOfTheGuest,
                        comment: commentOfTheGuest
                    }
                    response.render("blog-post.hbs", model)
                }
                else {
                    response.render("error404.hbs")
                }
            }
        })
    }

})


//deletes the guest's comment
router.post("/post/:id/deletecomment/:commentId", function (request, response) {
    if (request.session.isLoggedIn) {
        const commentId = parseInt(request.params.commentId)
        const blogId = parseInt(request.params.id)

        db.deleteBlogPostCommentById(commentId, function (error, changes) {
            if (error) {
                console.log(error)
                response.render("error500.hbs")
            }
            else {
                if (changes) {
                    response.redirect("/blog/post/" + blogId)
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



module.exports = router