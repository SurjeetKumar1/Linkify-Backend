import express from "express";
import cors from "cors";
import dotenv from 'dotenv'
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"

dotenv.config();

const app=express();

app.use(cors());
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static("uploads"))


const start=async()=>{
    try{
        const dbConnection=await  mongoose.connect(process.env.MONGODB_URL);
        console.log("Db connection scessfully!");
        app.listen(9090,()=>{
          console.log("server is running on port")
        })
    }catch(err){
        console.log("Error during connection",err)
    }

}
start();