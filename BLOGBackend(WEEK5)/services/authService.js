import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserTypeModel } from "../Models/UserModel.js";
//import { ArticleModel } from "../Models/ArticleModel.js";
import {config} from 'dotenv'
config()

//register function
export const register = async (userObj) => {
  //Create document
  const userDoc = new UserTypeModel(userObj);
  //validate for emprty passwords
  await userDoc.validate();
  //hash and replace plain password
  userDoc.password = await bcrypt.hash(userDoc.password, 10);
  //save
  const created = await userDoc.save();
  //convert document to object to remove password
  const newUserObj = created.toObject();
  //remove password
  delete newUserObj.password;
  //return user obj without password
  return newUserObj;
};

//authenticate function
export const authenticate = async ({ email, password }) => {
    //check user with email & role
  const user = await UserTypeModel.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email ");
    err.status = 401;
    throw err;
  }
  //if user valid ,but blocked by admin
  //compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid password");
    err.status = 401;
    throw err;
  }
  //check isActive state
  if(user.isActive===false){
    const err = new Error("Your account blocked. plz contact admin ");
    err.status= 403;
    throw err;
  }

  //generate token
  const token = jwt.sign({ userId: user._id, 
    role: user.role, email: user.email }, 
    process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const userObj = user.toObject();
  delete userObj.password;

  return { token, user: userObj };
};

// Add a comment to a specific article
export const addComment = async (articleId, commentObj) => {
  try {
    // Find article by ID
    const article = await ArticleModel.findById(articleId);
    if (!article) {
      const err = new Error("Article not found");
      err.status = 404;
      throw err;
    }

    // Push new comment into article's comments array
    article.comments.push(commentObj);

    // Save updated article
    const updatedArticle = await article.save();
    return updatedArticle;
  } catch (err) {
    throw new Error("Error adding comment: " + err.message);
  }
};
