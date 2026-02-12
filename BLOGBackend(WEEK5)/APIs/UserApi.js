import exp from "express";
import { register, authenticate } from "../services/authService.js";
import{ verifyToken }from "../middlewares/verifyToken.js"
import { ArticleModel } from "../Models/ArticleModel.js";

export const userRoute = exp.Router();

//Register user
userRoute.post("/users", async (req, res) => {
  //get user obj from req
  let userObj = req.body;
  //call register
  const newUserObj = await register({ ...userObj, role: "USER" });
  //send res
  res.status(201).json({ message: "user created", payload: newUserObj });
});



// Read all articles (protected route)
// This route allows authenticated users to fetch all articles.
// The `verifyToken` middleware ensures only users with a valid token can access it.
//Read all articles 
userRoute.get('/articles',async(req,res)=>{
    let articles=await ArticleModel.find();
    if(articles)
    {
        res.status(200).json({message:"all articles",payload:articles});
    }
})                                                                                                                                                                                                                                               
// Add comment to an article (protected route)
// This route allows authenticated users to add a comment to a specific article.
// The `:id` parameter in the URL identifies which article the comment belongs to.
//Add comments to article

userRoute.put('/articles/:articleId',async(req,res)=>{
    // get the articleId from url path
     let {articleId}=req.params;
     let {author,comment}=req.body;
     let articleOfDB=await ArticleModel.findById(articleId);
     if(!articleOfDB)
     {
       return res.status(401).json({message:"article not found"});
     }
      articleOfDB.comments.push({author,comment})
     let updatedArticle=await articleOfDB.save();
     res.status(200).json({message:"comment added succesfully",payload:updatedArticle})
})
