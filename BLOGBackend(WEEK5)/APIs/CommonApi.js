import exp from 'express'
export const commonRouter = exp.Router()
import { authenticate } from '../services/authService.js';
import { UserTypeModel } from '../Models/UserModel.js';
import bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';

//login 
commonRouter.post('/authenticate',async(req,res)=>{
     //get user cred object
      let userCred = req.body;
      //call authenticate service
      let { token, user } = await authenticate(userCred);
      //save tokan as httpOnly cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });
      //send res
      res.status(200).json({ message: "login success", payload: user });
    });


    //logout for User, Author and Admin
commonRouter.post('/logout', (req, res) => {
  // Clear the cookie named 'token'
  res.clearCookie('token', {
    httpOnly: true, // Must match original  settings
    secure: false,   // Must match original  settings
    sameSite: 'lax' // Must match original  settings
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
});

//update password or change password
commonRouter.put("changepassword",async(req,res)=>{
    //get current password and new password 
    const {email,oldpassword,newpassword}=req.body;
    const DBdata = await UserTypeModel.findOne({email})
    //check the current password 
    const comparePassword = await bcrypt.compare(oldpassword,DBdata.password)
    if(!comparePassword){
        res.status(400).json({message:"enter the correct password"})
    }
    //replace the current password with new password 
    const hashedPassword = await bcrypt.hash(newpassword,10)
    DBdata.password=hashedPassword
    DBdata.save();
    //send res
    res.status(200).json({message:"password updated sucessfully"})
})

