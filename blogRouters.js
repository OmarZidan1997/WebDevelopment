const express = require('express')
const db = require('./db')

const router = express.Router()

// Get all posts
router.get("/", function (request, response) {
  db.getAllBlogPosts(function (error, blogPosts) {
    var model = {}
    if (error) {
      model = {
        somethingWentWrong: true
      }
    } else {
      model = {
        blogPosts: blogPosts,
        somethingWentWrong: false
      }
    }
    response.render("blog.hbs", model)
  })
})
// Create a blog post 
router.post("/", function (request, response) {

  const title = request.body.title
  const content = request.body.content
  var model = {}
  const validationErrors = []

  if (title == null || title.trim() == "") {
    validationErrors.push("Must enter title")
  }

  if (content == null || content.trim() == "") {
    validationErrors.push("Must Enter content")
  }

  if (validationErrors.length == 0) {

    db.createBlogPost(title, content, function (error, id) {
      if (error) {

        model = {
          somethingWentWrong: true
        }

        response.render("create-blog-post.hbs", model)
      }
      else {

        response.redirect("/blog/" + id)
      }

    })

  }
  else {
    model = {
      title,
      content,
      validationErrors
    }
    response.render("create-blog-post.hbs", model)
  }
})


router.get('/create-blog-post', function (request, response) {
  response.render("create-blog-post.hbs")
})


// get a specific blog post by ID
router.get("/:id", function (request, response) {

  const id = parseInt(request.params.id) //converts the id from string to int
  var model = {}
  db.getBlogPostAndCommentsById(id, function (error, blogPost) {
    if (error) {
      model = {
        somethingWentWrong: true
      }
    }
    else {
      console.table(blogPost)
      model = {
        somethingWentWrong: false,
        blogPost
      }
    }

    response.render("blog-post.hbs", model)
  })

})


// delete blog post by ID
router.post("/delete-blog-post/:id", function (request, response) {

  const id = parseInt(request.params.id)

  db.deleteBlogPostById(id, function (error) {
    response.redirect("/blog")
  })

})

// shows the form to edit a specific post 
router.get("/edit-blog-post/:id", function (request, response) {

  const id = parseInt(request.params.id)
  var model = {}
  db.getBlogPostById(id, function (error, blogPost) {
    if (error) {

      model = {
        somethingWentWrong: true
      }

      response.render("edit-blog-post.hbs", model)
    }
    else {

      model = {
        somethingWentWrong: false,
        blogPost
      }

      response.render("edit-blog-post.hbs", model)
    }

  })

})

router.post("/edit-blog-post/:id", function (request, response) {

  const id = parseInt(request.params.id)
  const title = request.body.title
  const content = request.body.content

  var model = {}
  const validationErrors = []

  if (title == null || title.trim() == "") {
    validationErrors.push("Must enter title")
  }
  if (content == null || content.trim() == "") {
    validationErrors.push("Must Enter content")
  }

  if (validationErrors.length == 0) {

    db.updateBlogPostById(title, content, id, function (error) {
      if (error) {
        model = {
          somethingWentWrong: true
        }
        response.render("create-blog-post.hbs", model)
      } else {
        response.redirect("/blog")
      }

    })
  }
  else {
    db.getBlogPostById(id, function (error, blogPost) {
      if (error) {

        model = {
          somethingWentWrong: true
        }

        response.render("edit-blog-post.hbs", model)
      }
      else {

        model = {
          somethingWentWrong: false,
          validationErrors,
          blogPost
        }

        response.render("edit-blog-post.hbs", model)
      }

    })
  }
})


router.post("/:id/createcomment", function (request, response) {

  const blogId = parseInt(request.params.id)
  const name = request.body.name
  const comment = request.body.comment
  var model = {}
  const validationErrors = []

  if (name == null || name.trim() == "") {
    validationErrors.push("Please enter name")
  }
  if (comment == null || comment.trim() == "") {
    validationErrors.push("Please enter comment")
  }

  if (validationErrors.length == 0) {
    db.createBlogPostComment(name, comment, blogId, function (error) {
      if (error) {

        model = {
          somethingWentWrong: true,
        }

        response.render("create-blog-post.hbs", model)
      }
      else {

        response.redirect("/blog/" + blogId)
      }

    })

  }
  else {

    db.getBlogPostAndCommentsById(blogId, function (error, blogPost) {
      if (error) {

        model = {
          somethingWentWrong: true
        }

        response.render("blog-post.hbs", model)
      }
      else {
        model = {
          somethingWentWrong: false,
          validationErrors,
          blogPost,
          name,
          comment
        }

        response.render("blog-post.hbs", model)
      }
    })

  }

})



router.post("/:id/deletecomment/:commentId", function (request, response) {

  const commentId = parseInt(request.params.commentId)
  const blogId = parseInt(request.params.id)
  var model = {}

  db.deleteBlogPostCommentById(commentId, function (error) {
    if (error) {

      model = {
        somethingWentWrong: true,
      }

      response.render("create-blog-post.hbs", model)
    }
    else {

      response.redirect("/blog/" + blogId)
    }

  })

})



module.exports = router