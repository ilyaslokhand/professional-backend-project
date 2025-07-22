import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"; /// nodejs method for file system operations
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

const UploadOnCloudinary = async (localfilePath)=>{
  try {

    if (!localfilePath) return null;
    const responce = await cloudinary.uploader.upload(localfilePath,{
      resource_type: "auto",
      
    });

    console.log("file upload successfully to cloudinary", responce.url);
    fs.unlinkSync(localfilePath); 
    return responce;
    
  } catch (error) {
    fs.unlinkSync(localfilePath); // remove the file from local storage if operation get fails
    console.log("file upload failed", error);
    return null;
  }
}

export default UploadOnCloudinary;