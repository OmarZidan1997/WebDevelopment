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
		commentid INTEGER PRIMARY KEY,
		name TEXT,
		comment TEXT,
        blogId INTEGER,
        CONSTRAINT blogId
            FOREIGN KEY (blogId) REFERENCES blogPost(id)
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
    const query = `SELECT * FROM blogPost WHERE id = ?`

    db.get(query, values, function (error, blogPost) {
        callback(error, blogPost)
    })
}

exports.getBlogPostAndCommentsById = function (id, callback) {

    const values = [id]
    const query = `
    SELECT bp.id,bp.title,bp.content,bpc.commentid,bpc.name,bpc.comment
    FROM blogPost as bp
    LEFT JOIN blogPostComment as bpc 
    ON bpc.blogId = bp.id
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

    const query = "INSERT INTO blogPostComment (name,comment,blogId) VALUES (?,?,?)"
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



/*---------- Guestbooks-------------------------*/
/*--------------------------------------------- */


/*--------- Guestbook table-------*/
db.run(`
	CREATE TABLE IF NOT EXISTS guestbook (
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
        guestbookId INTEGER,
        CONSTRAINT guestbookId
            FOREIGN KEY (guestbookId) REFERENCES guestbook(id)
            ON DELETE CASCADE
	)
`)
/***********************************/

exports.createGuestbookComment = function (name, message, callback) {

    const query = "INSERT INTO guestbook(name,comment) VALUES(?,?)"
    const values = [name, message]

    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.getGuestbookCommentById = function (id, callback) {

    const values = [id]
    const query = `SELECT * FROM guestbook WHERE id = ?`

    db.get(query, values, function (error, guestbookComment) {
        callback(error, guestbookComment)
    })
}

exports.getAllGuestbookComments = function (callback) {

    const query = `
    SELECT gb.id,gb.name,gb.comment,gbr.replyId,gbr.reply
    FROM guestbook as gb
    LEFT JOIN guestbookReply as gbr 
    ON gbr.guestbookId = gb.id
    `

    db.all(query, function (error, guestbook) {
        callback(error, guestbook)
    })
}

exports.deleteCommentFromGuestbook = function (id, callback) {

    const values = [id];
    const query = `DELETE FROM  guestbook WHERE id = ?`
    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.createGuestbookReply = function (commentId, reply, callback) {

    const query = `INSERT INTO guestbookReply(reply,guestbookId) VALUES(?,?)`
    const values = [reply, commentId];
    db.run(query, values, function (error) {
        callback(error)
    })
}

exports.updateGuestbookReply = function (newReply, id, callback) {
    const query = "UPDATE guestbookReply SET reply = ? WHERE guestbookId = ?"
    const values = [newReply, id]
    db.run(query, values, function (error) {
        const changes = this.changes
        callback(error, changes)
    })
}

exports.getGuestbookReplyById = function (id, callback) {

    const query = `
    SELECT reply
    FROM guestbookReply 
    WHERE guestbookId = ?`
    const values = [id]

    db.get(query, values, function (error, reply) {
        callback(error, reply)
    })
}
exports.deleteGuestbookReplyById = function (id, callback) {

    const query = `DELETE FROM  guestbookReply WHERE replyId = ?`
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
    const query = `SELECT * FROM project WHERE id = ?`

    db.get(query, values, function (error, project) {
        callback(error, project)
    })
}

exports.getAllProjects = function (callback) {

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
