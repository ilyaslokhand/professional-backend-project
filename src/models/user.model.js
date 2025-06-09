import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  username:{
    type:String,
    required:true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  email: {
    type:String,
    required:true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName:{
     type:String,
     required:true,
     trim: true,
     index: true,
  },
  avatar:{
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  WatchHistory:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Videos"
  }],
  Password:{
    type: String,
    required: [true, 'password is required'],
  },
  refreshToken: {
    type: String,
  }


}, {timestamps: true});

userSchema.pre("save", async function (next) {
  if(!this.isModified("Password")) return next();
  this.Password = await  bcrypt.hash(this.Password,10)
  next();
} )

userSchema.methods.isValidatePassword = async function (Password) {
  return await bcrypt.compare(Password, this.Password);
}

userSchema.methods.generateAccessToken = function(){
 return jwt.sign({
    _id: this._id,
    username:this.username,
    fullName:this.fullName,
    email: this.email,
  },
  process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
)
}

userSchema.methods.refreshAccessToken = function(){
 return jwt.sign({
    _id: this._id,
  },
  process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
)
}

export const User = mongoose.model("User", userSchema);