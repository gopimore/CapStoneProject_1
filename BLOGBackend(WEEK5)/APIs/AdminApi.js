import exp from 'express'
import { UserTypeModel } from '../Models/UserModel.js'
export const adminRoute=exp.Router()

//read all articles
//blockusers 
adminRoute.put("/block/:_id",async(req,res)=>{
    let userId=req.params;
    let userofDB= await UserTypeModel.findById(userId);
    if(!userofDB){
        res.status(403).json({message:"user not found"})
    }
    let updateUser=await UserTypeModel.findByIdAndUpdate(userId,{$set :{isActive : false}},{new : true})
    //responce
    res.status(200).json({message:"user is blocked sucessfully",payload:updateUser})
})
// unblock user roles
adminRoute.put("/unblock/:_id",async(req,res)=>{
    let userId=req.params;
    let userofDB= await UserTypeModel.findById(userId);
    if(!userofDB){
        res.status(403).json({message:"user not found"})
    }
    let updateUser=await UserTypeModel.findByIdAndUpdate(userId,{$set :{isActive : true}},{new : true})
    //res
    res.status(200).json({message:"user unblocked sucessfully",payload:updateUser})
})