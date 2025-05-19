import dotenv from "dotenv";
import ConnectDB from "./db/index.js";

dotenv.config({ path: "./.env" });


ConnectDB();

// const app = express();

// ;( async ()=> {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URI}/ ${DB_NAME}`);
//     app.on("error", (error)=>{
//       console.log("error connecting to express", error)
//     })

//     app.listen(process.env.PORT, ()=>{
//       console.log(`Server is running on port ${process.env.PORT}`);
//     })

//   } catch (error) {
//     console.log("Error connecting to MongoDB", error);
//   }
// })