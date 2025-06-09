import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

const ConnectDB = async ()=>{
 try {
  
  const connectionistance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
  });
    console.log(`\n Connected to MongoDB: !! DB HOST: ${connectionistance.connection.host}`)

 } catch (error) {
  console.log("Error connecting to MongoDB", error);
  process.exit(1);
 }
}

export default ConnectDB;