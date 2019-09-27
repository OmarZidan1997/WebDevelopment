const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("database.db")

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
		FOREIGN KEY (blogId) REFERENCES blogPosts(id)
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
    const query = "SELECT * FROM blogPosts WHERE id = ? "
    const values = [id]
        
    // SELECT *
    // FROM blogPosts as bp
    // INNER JOIN blogPostComments as bpc
    // ON bpc.blogId = bp.id
    // WHERE bp.id = 89

    db.get(query,values,function(error,blogPost){
        callback(error,blogPost)
    })
}

exports.updateBlogPostById = function(newTitle, newContent, id, callback){
    const query = "UPDATE blogPosts SET title = ?, content = ? WHERE id = ?"
    const values = [newTitle, newContent, id]
    console.table(values)
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

exports.getAllBlogPostComments = function(blogId,callback){

    const query = "SELECT * FROM blogComments WHERE blogId = ?"
    const values = [blogId]
    db.all(query,values,function(error,blogComments){
        callback(error,blogComments)
    })
}
