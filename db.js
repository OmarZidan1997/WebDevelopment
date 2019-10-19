const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("database.db")

db.run("PRAGMA foreign_keys = ON")

/*----------Blog--------------- */
/*------------------------------*/
db.run(`
	CREATE TABLE IF NOT EXISTS blogPost (
		id INTEGER PRIMARY KEY,
        title TEXT,
        content TEXT,
        timePostAdded TEXT
	)
`)
db.run(`
	CREATE TABLE IF NOT EXISTS blogPostComment (
		commentId INTEGER PRIMARY KEY,
		name TEXT,
		comment TEXT,
        blogPostid INTEGER,
        CONSTRAINT blogPostid
            FOREIGN KEY (blogPostid) REFERENCES blogPost(id)
            ON DELETE CASCADE
	)
`)

exports.getBlogPostsForEachPage = function (postPerPage, offset, callback) {

    const query = `SELECT COUNT(*) OVER() AS nrOfPosts,* 
    FROM blogPost
    Limit ? 
    OFFSET ?`

    const values = [postPerPage, offset]

    db.all(query, values, function (error, blogPosts) {
        callback(blogPosts, error)
    })

}

exports.createBlogPost = function (title, content, timePostAdded, callback) {

    const query = "INSERT INTO blogPost(title,content,timePostAdded) VALUES(?,?,?)"
    const values = [title, content, timePostAdded]

    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}

exports.getBlogPostById = function (id, callback) {

    const values = [id]
    const query = " SELECT * FROM blogPost WHERE id = ?"

    db.get(query, values, function (error, blogPost) {
        callback(error, blogPost)
    })
}

exports.getBlogPostAndCommentsById = function (id, callback) {

    const values = [id]
    const query = `
    SELECT bp.id,bp.title,bp.content,bpc.commentId,bpc.name,bpc.comment
    FROM blogPost as bp
    LEFT JOIN blogPostComment as bpc 
    ON bpc.blogPostid = bp.id
    WHERE bp.id = ?
    `

    db.all(query, values, function (error, blogPost) {
        callback(error, blogPost)
    })
}

exports.updateBlogPostById = function (newTitle, newContent, id, callback) {
    const query = "UPDATE blogPost SET title = ?, content = ? WHERE id = ?"
    const values = [newTitle, newContent, id]
    db.run(query, values, function (error) {
        const changes = this.changes
        callback(error, changes)
    })
}

exports.deleteBlogPostById = function (id, callback) {

    const query = "DELETE FROM blogPost WHERE id = ?"
    const values = [id]

    db.run(query, values, function (error) {
        callback(error)
    })
}

/*----------Blog comments--------------- */
/*--------------------------------------*/



exports.createBlogPostComment = function (name, comment, blogId, callback) {

    const query = "INSERT INTO blogPostComment (name,comment,blogPostid) VALUES (?,?,?)"
    const values = [name, comment, blogId]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.deleteBlogPostCommentById = function (commentId, callback) {

    const query = "DELETE FROM blogPostComment WHERE commentId = ?"
    const values = [commentId]
    db.run(query, values, function (error) {
        const changes = this.changes
        callback(error,changes)
    })
}



/*-------------Guestbook-------------------------*/
/*--------------------------------------------- */


/*--------- Guestbook table-------*/
db.run(`
	CREATE TABLE IF NOT EXISTS guestbookComment (
		id INTEGER PRIMARY KEY,
        name TEXT,
        comment TEXT
	)
`)
/*****************************/


/*--------- guestbookReplies-------*/
db.run(`
	CREATE TABLE IF NOT EXISTS guestbookReply (
		replyId INTEGER PRIMARY KEY,
        reply TEXT,
        guestbookCommentId INTEGER,
        CONSTRAINT guestbookCommentId
            FOREIGN KEY (guestbookCommentId) REFERENCES guestbookComment(id)
            ON DELETE CASCADE
	)
`)
/***********************************/

exports.createGuestbookComment = function (name, message, callback) {

    const query = "INSERT INTO guestbookComment(name,comment) VALUES(?,?)"
    const values = [name, message]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.getGuestbookCommentById = function (id, callback) {

    const values = [id]
    const query = "SELECT * FROM guestbookComment WHERE id = ?"

    db.get(query, values, function (error, guestbookComment) {
        callback(error, guestbookComment)
    })
}

exports.getAllGuestbookComments = function (callback) {

    const query = `
    SELECT gbc.id,gbc.name,gbc.comment,gbr.replyId,gbr.reply
    FROM guestbookComment as gbc
    LEFT JOIN guestbookReply as gbr 
    ON gbr.guestbookCommentId = gbc.id
    `

    db.all(query, function (error, guestbook) {
        callback(error, guestbook)
    })
}

exports.deleteCommentFromGuestbook = function (id, callback) {

    const values = [id];
    const query = "DELETE FROM  guestbookComment WHERE id = ?"
    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.createGuestbookReply = function (commentId, reply, callback) {

    const query = "INSERT INTO guestbookReply(reply,guestbookCommentId) VALUES(?,?)"
    const values = [reply, commentId];
    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.updateGuestbookReply = function (newReply, id, callback) {
    const query = "UPDATE guestbookReply SET reply = ? WHERE guestbookCommentId = ?"
    const values = [newReply, id]
    db.run(query, values, function (error) {
        const changes = this.changes
        callback(error, changes)
    })
}

exports.getGuestbookReplyByCommentId = function (id, callback) {

    const query = `
    SELECT reply
    FROM guestbookReply 
    WHERE guestbookCommentId = ?
    `
    const values = [id]

    db.get(query, values, function (error, reply) {
        callback(error, reply)
    })
}
exports.deleteGuestbookReplyById = function (id, callback) {

    const query = "DELETE FROM guestbookReply WHERE replyId = ?"
    const values = [id];
    db.run(query, values, function (error) {
        callback(error)
    })
}


/*---------- Portfolio -------------------------*/
/*--------------------------------------------- */


/*****************Portfolio table ****************/

db.run(`
	CREATE TABLE IF NOT EXISTS project (
		id INTEGER PRIMARY KEY,
        title TEXT,
        content TEXT
	)
`)
/*************************************************/

exports.createPortfolioProject = function (title, content, callback) {

    const query = "INSERT INTO project(title,content) VALUES(?,?)"
    const values = [title, content]

    db.run(query, values, function (error) {
        const id = this.lastID
        callback(error, id)
    })
}
exports.getPortfolioProjectById = function (id, callback) {

    const values = [id]
    const query = "SELECT * FROM project WHERE id = ?"

    db.get(query, values, function (error, project) {
        callback(error, project)
    })
}

exports.getAllProjectsInPortfolio = function (callback) {

    const query = "SELECT * FROM project"

    db.all(query, function (error, projectIdAndTitle) {
        callback(error, projectIdAndTitle)
    })
}

exports.deleteProjectById = function (id, callback) {

    const query = "DELETE FROM project WHERE id = ?"
    const values = [id]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.searchForProjects = function (projectsToSearch, callback) {

    const query = `
    SELECT * 
    FROM project 
    WHERE title LIKE ? 
    OR
    content LIKE ?`

    const values = ["%" + projectsToSearch + "%", "%" + projectsToSearch + "%"]

    db.all(query, values, function (error, project) {
        callback(error, project)
    })
}
