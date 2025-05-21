import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });


ConnectDB().then(()=>{
  app.on("error", (error)=>{
    console.log("error connecting to app", error);
  })

  app.listen(process.env.PORT || 8000,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
  })

  

}).catch((error)=>{
  console.log("error connecting to DB",error)
})
