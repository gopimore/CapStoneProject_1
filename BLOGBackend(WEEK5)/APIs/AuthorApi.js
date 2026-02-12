import exp from "express";
import { authenticate, register } from "../services/authService.js";
import { UserTypeModel } from "../Models/UserModel.js";
import { ArticleModel } from "../Models/ArticleModel.js";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const authorRoute = exp.Router();

//Register author(public)
authorRoute.post("/users", async (req, res) => {
  //get user obj from req
  let userObj = req.body;
  //call register
  const newUserObj = await register({ ...userObj, role: "AUTHOR" });
  //send res
  res.status(201).json({ message: "author created", payload: newUserObj });
});


//Create article(protected route)
authorRoute.post("/articles",verifyToken ,checkAuthor, async (req, res) => {
  //get article from req
  let article = req.body;

  //create article document
  let newArticleDoc = new ArticleModel(article);
  //save
  let createdArticleDoc = await newArticleDoc.save();
  //send res
  res.status(201).json({ message: "article created", payload: createdArticleDoc });
});

//Read artiles of author(protected route)
authorRoute.get("/articles/:authorId",verifyToken ,checkAuthor, async (req, res) => {
  //get author id
  let aid = req.params.authorId;

  //read atricles by this author which are acticve
  let articles = await ArticleModel.find({ author: aid, isArticleActive: true }).populate("author", "firstName email");
  //send res
  res.status(200).json({ message: "articles", payload: articles });
});

//edit article(protected route)
authorRoute.put("/articles",verifyToken ,checkAuthor,async (req, res) => {
  //get modified article from req
  let { articleId, title, category, content,author } = req.body;
  //find article
  let articleOfDB = await ArticleModel.findOne({_id:articleId,author:author});
  if (!articleOfDB) {
    return res.status(401).json({ message: "Article not found" });
  }
  
  //update the article
  let updatedArticle = await ArticleModel.findByIdAndUpdate(
    articleId,
    {
      $set: { title, category, content },
    },
    { new: true },
  );
  //send res(updated article)
  res.status(200).json({ message: "article updated", payload: updatedArticle });
});

// Delete (soft delete) article (protected route)
// This route allows an authenticated author to mark their article as inactive.
// Instead of removing the document, we set `isArticleActive` to false.
authorRoute.delete("/articles", verifyToken, checkAuthor, async (req, res) => {
  // Extract articleId and author from request body
  let { articleId, author } = req.body;
  // Find the article belonging to this author
  let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: author });
  if (!articleOfDB) {
    return res.status(404).json({ message: "Article not found" });
  }
  // Perform soft delete by updating `isArticleActive` to false
  let deletedArticle = await ArticleModel.findByIdAndUpdate(
    articleId,
    { $set: { isArticleActive: false } },
    { new: true }
  );
  // Send response with the updated article
  res.status(200).json({ message: "article deleted (soft)", payload: deletedArticle });
});
