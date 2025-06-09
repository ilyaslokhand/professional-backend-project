import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema({
  videofile:{
    type:String,
    required:true,
  },
  thumbnail:{
    type:String,
    required:true,
  },
  title:{
    type:String,
    required:true,

  },
  discription:{
    type:String,
    required:true,
  },
  videoOwner:{
   type: mongoose.Schema.Types.ObjectId,
   ref: "User"
  },
  duration:{
    type:Number,
    required:true,
  },
  views:{
    type:Number,
    default:0,
  },

  isPublished:{
    type:Boolean,
    default:true,
  }


}, { timestamps: true });

VideoSchema.plugin(mongooseAggregatePaginate);

export const Videos = mongoose.model("Videos", VideoSchema);