import { User } from "../models/user.model.js";
import apiError from "../utils/apiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req,res,next)=>{
 try {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
  if (!token){
   throw new apiError(401, "unauthorized request");
  }
 
 const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
 
 const user = await User.findById(decodedToken?._id).select("-Password -refreshToken");
 
 if (!user){
   throw new apiError(401, "invalid token");
 }
 
 req.user = user;
 next();
 } catch (error) {
  throw new apiError(401, error?.message || "invalid access token");
 }
})


