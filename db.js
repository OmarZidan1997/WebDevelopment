const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("database.db")

db.run("PRAGMA foreign_keys = ON")

/*----------Blog--------------- */
/*------------------------------*/
db.run(`
	CREATE TABLE IF NOT EXISTS blogPosts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT
	)
`)
db.run(`
	CREATE TABLE IF NOT EXISTS blogPostComments (
		commentid INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		comment TEXT,
        blogId INTEGER,
        CONSTRAINT blogId
        FOREIGN KEY (blogId) REFERENCES blogPosts(id)
        ON DELETE CASCADE
	)
`)

exports.getAllBlogPosts = function(callback){

    const query = "SELECT * FROM blogPosts"

    db.all(query,function(error,blogPosts){
        callback(error,blogPosts)
    })

}

exports.createBlogPost = function(title,content,callback){

    const query = "INSERT INTO blogPosts(title,content) VALUES(?,?)"
    const values = [title,content]
    
    db.run(query,values,function(error){
        const id = this.lastID
        callback(error,id)
    })
}

exports.getBlogPostById = function(id,callback){
    
    const values = [id]
    const query = `SELECT * FROM blogPosts WHERE id = ?`

    db.get(query,values,function(error,blogPost){
        callback(error,blogPost)
    })
}

exports.getBlogPostAndCommentsById = function(id,callback){
    
    const values = [id]
    const query = `
    SELECT bp.id,bp.title,bp.content,bpc.commentid,bpc.name,bpc.comment
    FROM blogPosts as bp
    LEFT JOIN blogPostComments as bpc 
    ON bpc.blogId = bp.id
    WHERE bp.id = ?
    `

    db.all(query,values,function(error,blogPost){
        callback(error,blogPost)
    })
}

exports.updateBlogPostById = function(newTitle, newContent, id, callback){
    const query = "UPDATE blogPosts SET title = ?, content = ? WHERE id = ?"
    const values = [newTitle, newContent, id]
    db.run(query,values,function(error){
        callback(error)
    })
}

exports.deleteBlogPostById = function(id,callback){

    const query = "DELETE FROM blogPosts WHERE id = ?"
    const values = [id]

    db.run(query,values,function(error){
        callback(error)
    })
}

/*----------Blog comments--------------- */
/*--------------------------------------*/



exports.createBlogPostComment = function(name,comment,blogId,callback){

    const query = "INSERT INTO blogPostComments (name,comment,blogId) VALUES (?,?,?)"
    const values = [name,comment,blogId]
    
    db.run(query,values,function(error){
        callback(error)
    })
}

exports.deleteBlogPostCommentById = function(commentId,callback){

    const query = "DELETE FROM blogPostComments WHERE commentId = ?"
    const values = [commentId]
    db.run(query,values,function(error){
        callback(error)
    })
}



/*---------- Guestbook section starts ----------*/
/*--------------------------------------------- */

/*--------- Admin Table-------*/
db.run(`
	CREATE TABLE IF NOT EXISTS admin (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT,
        password TEXT
	)
`)
/*****************************/

/*--------- Guestbook table-------*/
db.run(`
	CREATE TABLE IF NOT EXISTS guestbook (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        comment TEXT
	)
`)
/*****************************/


/*--------- guestbookReplies-------*/
db.run(`
	CREATE TABLE IF NOT EXISTS guestbook_replies (
		replyId INTEGER PRIMARY KEY AUTOINCREMENT,
        reply TEXT,
        guestbookId INTEGER,
        CONSTRAINT guestbookId
        FOREIGN KEY (guestbookId) REFERENCES guestbook(id)
        ON DELETE CASCADE
	)
`)
/***********************************/

exports.createGuestbookComment = function(name,message,callback){

    const query = "INSERT INTO guestbook(name,comment) VALUES(?,?)"
    const values = [name,message]
    
    db.run(query,values,function(error){
        callback(error)
    })
}

exports.getAllGuestbookComments = function(callback){
    
    const query = `
    SELECT gb.id,gb.name,gb.comment,gbr.replyId,gbr.reply
    FROM guestbook as gb
    LEFT JOIN guestbook_replies as gbr 
    ON gbr.guestbookId = gb.id
    `

    db.all(query,function(error,guestbook){
        callback(error,guestbook)
    })
}

exports.deleteCommentFromGuestbook = function(id,callback){
    
    const query = `DELETE FROM  guestbook WHERE id = ?`
    const values = [id];
    db.run(query,values,function(error){
        callback(error)
    })
}

exports.createGuestbookReply = function(commentId,reply,callback){
    
    const query = `INSERT INTO guestbook_replies(reply,guestbookId) VALUES(?,?)`
    const values = [reply,commentId];
    db.run(query,values,function(error){
        callback(error)
    })
}

exports.updateGuestbookReply = function(newReply,id, callback){
    const query = "UPDATE guestbook_replies SET reply = ? WHERE guestbookId = ?"
    const values = [newReply,id]
    db.run(query,values,function(error){
        callback(error)
    })
}

exports.getGuestbookReplyById = function(id,callback){
    
    const query = `SELECT guestbook_replies.reply 
    FROM guestbook_replies 
    WHERE guestbookId = ?`
    const values = [id]

    db.get(query,values,function(error,reply){
        callback(error,reply)
    })
}