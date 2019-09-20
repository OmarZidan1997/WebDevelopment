const sqlite3 = require("sqlite3")

const db = new sqlite3.Database("database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS blogPosts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT
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
    const query = "SELECT * FROM blogPosts WHERE id = ?"
    const values = [id]

    db.get(query,values,function(error,blogPost){
        callback(error,blogPost)
    })
}

exports.deleteBlogPostById = function(id,callback){

    const query = "DELETE FROM blogPosts WHERE id = ?"
    const values = [id]

    db.run(query,values,function(error){
        callback(error)
    })
}

