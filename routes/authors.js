const express = require('express')
const router = express.Router()
const Author = require("../models/author")
const Book = require("../models/book")

// All Authors Route
router.get('/', async (req,res) =>{
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {authors: authors, searchOptions:req.query})
    }catch{
        res.redirect("/")
    }
    
})


//New Author Route
router.get('/new', (req,res) =>{
    res.render('authors/new', {author:new Author()})
})

//Create Authours Route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })

  try {
    const newAuthor = await author.save()
    res.redirect(`/authors/${newAuthor.id}`) 
  } catch (err) {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

router.get("/:id", async (req,res) => {
  try{
    const author = await Author.findById(req.params.id)
    const books = await Book.find({author: author.id})
    res.render("authors/show", {
      author: author,
      booksByAuthor: books
    })
  }catch (err) {
    console.log(err)
    res.redirect("/")
  }
})

router.get("/:id/edit", async (req,res) => {
  try{
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', {author: author})
  }catch{
    res.redirect("/authors")
  }
})

router.put("/:id", async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name  // <== Important fix
    await author.save()
    res.redirect(`/authors/${author.id}`)  // <== Also fixed
  } catch {
    if (author == null) {
      res.redirect("/")
    } else {
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error Updating Author'
      })
    }
  }
})


router.delete("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({ author: author.id })

    if (books.length > 0) {
      throw new Error("Cannot delete author with books")
      res.redirect("/")
    }

    await Author.findByIdAndDelete(req.params.id)
    res.redirect("/authors")
  } catch (err) {
    console.error("Delete error:", err.message)
    res.redirect("/authors")
  }
})



module.exports = router