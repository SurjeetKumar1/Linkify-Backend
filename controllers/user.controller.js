import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import PDFDocument from "pdfkit";
import ConntionRequest from "../models/connection.model.js"
import bodyParser from "body-parser";



const convertUserDataToPDF=async(userData)=>{
    const doc=new PDFDocument();
    const outputPath=crypto.randomBytes(32).toString("hex")+".pdf";
    const stream=fs.createWriteStream("uploads/"+outputPath);
    doc.pipe(stream);
    doc.image(`uploads/${userData.userId.profilePicture}`,{align:"center",width:100});
    doc.fontSize(14).text(`Name:${userData.userId.name}`)
    doc.fontSize(14).text(`Username:${userData.userId.username}`)
    doc.fontSize(14).text(`Email:${userData.userId.email}`)
    doc.fontSize(14).text(`Bio:${userData.userId.bio}`)
    doc.fontSize(14).text(`Current Position:${userData.currPost}`)
    doc.fontSize(14).text(`Past Work:`)

    userData.pastWork.forEach((work, indx) => {
      doc.fontSize(14).text(`Company Name: ${work.company}`)
      doc.fontSize(14).text(`Position: ${work.position}`)
      doc.fontSize(14).text(`Years: ${work.years}`)
    });

    doc.end();
    return outputPath;
}

export const register = async (req, res) => {
  const { name, email, password, username } = req.body;
  if (!name || !email || !password || !username) {
    return res.status(400).json({ Message: "All fields are required!" });
  }
  const existingUsername = await User.findOne({ username });
if (existingUsername) {
  return res.status(400).json({ Message: "Username already exists!" });
}
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ Message: "User Already Exist!" });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User({
    name,
    email,
    password: hashPassword,
    username,
  });
  await newUser.save();

  const profile = new Profile({ userId: newUser._id });
  await profile.save();
  res.json({ Message: "User created successfully!" });

  try {
  } catch (err) {
    console.log("Error duting Register!", err);
    res.status(500).json({ Message: "Server Error!", Error: err });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ Message: "All fields are required!" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ Message: "User does not exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ Message: "Invalid Credentials" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { $set: { token } });
    return res.json({token});


  } catch (err) {
    console.log("Error duting Register!", err);
    res.status(500).json({ Message: "Server Error!", Error: err });
  }
};

export const uploadProfilePicture=async(req,res)=>{
    const {token}=req.body;
    console.log(token);
    try{
        const user=await User.findOne({token});
        if(!user){
            return res.status(404).json({message:"User not found!"})
        }
        user.profilePicture=req.file.filename;
        await user.save();
        return res.json({Message:"Profile picture updated", file: req.file.filename});

    }catch(err){
        console.log(err);
        return res.status(500).json({message:"Server Error",Error:err});
    }
}

export const updateUserProfile=async(req,res)=>{
    const { token, ...newUserData }=req.body;
try{
    const user=await User.findOne({token:token});
    if(!user){
        return res.status(404).json({Message:"User not found!"})
    }
    const {username,email}=newUserData;
    const existingUser=await User.findOne({$or:[{username},{email}]});

    if(existingUser){
        if(existingUser || String(existingUser._id)!==String(user._id)){
            return res.status(400).json({Message:"User Already exists"})
        }
    }
    Object.assign(user,newUserData);
    await user.save();
    return res.json({Message:"User Updated"});

}catch(err){
    console.log("Error during updating user profile")
    res.json(500).send({message:"Server Error!"})
}
}

export  const getUserAndProfile=async(req,res)=>{
    const {token}=req.query;
    // console.log(token);
    try{
        const user=await User.findOne({token});
        if(!user){
            return res.status(404).json({Message:"User not found!"});
        }
        const userProfile = await Profile.findOne({ userId: user._id })
        .populate('userId', 'name email username profilePicture');

        res.json({userProfile});


    }catch(err){
        console.log(err);
        res.status(500).json({Mesage:"Server Error!",Error:err.message});
    }
}

export  const updateProfileData=async(req,res)=>{
    const { token, ...newProfileData }=req.body;
    try{
        const userProfile=await User.findOne({token});
        if(!userProfile){
            return res.status(404).json({Message:"User not found!"});
        }

        const profile_to_update=await Profile.findOne({userId:userProfile._id});
        
        Object.assign(profile_to_update,newProfileData);
        await profile_to_update.save();


    }catch(err){
        console.log(err);
        res.status(500).json({Mesage:"Server Error!",Error:err.message});
    }
}

export const getAllUserProfile=async(req,res)=>{
    try{
        const profile= await Profile.find({}).populate('userId', 'name email username profilePicture');
        res.send(profile)
    }catch(err){
        console.log("Error During Getting All Profiles!",err);
        res.status(500).json({Message:"Srver Error!",Error:err.msg})
    }
}

export const downloadProfile=async(req,res)=>{
  const userId=req.query.id;
  const userProfile=await Profile.findOne({userId:userId}).populate('userId', 'name email username profilePicture')

  let outputPath =await convertUserDataToPDF(userProfile);
  return res.json({Message:outputPath});
}

export const sendConnectionRequest=async(req,res)=>{
  const {token,connectionId}=req.body;

  //token se pata chalega kon bhej raha hai;
  //connection id se pata chalega kisko bhej raha hai

  try{
    const user=await User.findOne({token});
    if(!user){
      return res.status(404).json({Message:"User not exist!"});
    }

    const connectionUSer=await User.findOne({_id:connectionId});
    if(!connectionUSer){
      return res.status.json({Message:"Connection User Not Found!"});
    }
    const existingRequest=await ConntionRequest.findOne({userId:user._id,connectionId:connectionUSer._id})  //user.Id means main jo request bhej raha hai//connectionUSer._id-> jo usse connect hai
    if(existingRequest){
      return res.status(400).json({message:"Request Alreday Send!"});
    }

    const request=new ConntionRequest({
      userId:user._id,
      connectionId:connectionUSer._id
    })
    await request.save();
    return res.json({Message:"Request sent"})
  }catch(err){
      console.log("Error During Getting All Profiles!",err);
      res.status(500).json({Message:"Srver Error!",Error:err.msg})
  }
}


export const getMyconnectionRequest=async(req,res)=>{
  const {token}=req.query;
  console.log(token);
  try{
    const user=await User.findOne({token});
    if(!user){
      return res.status(404).json({Message:"User not exist!"});
    }
    const connection=await ConntionRequest.find({userId:user._id}).populate('userId', 'name email username profilePicture');;
   res.json({connection});
  }catch(err){
    console.log("Error during Getting My Connections!");
    res.status(500).json({Message:"Server Errror",Error:err.message});
  }
}

export const whatAreMyconnections=async(req,res)=>{  //mere conections kon kon hai means mujhe kisne kisne kisne connection request bheja hai
  const {token}=req.query;
  try{
    const user=await User.findOne({token});
    if(!user){
      return res.status(404).json({Message:"User not exist!"});
    }
    const connection=await ConntionRequest.find({connectionId:user._id}).populate('userId', 'name email username profilePicture');
     res.json({connection});
  }catch(err){
    console.log("Error during Getting My Connections!");
    res.status(500).json({Message:"Server Errror",Error:err.message});
  }
}

export const acceptConnectionRequest=async(req,res)=>{
  const {token,requestId,action_type}=req.body;
  try{
    const user=await User.findOne({token});
    if(!user){
      return res.status(404).json({Message:"User not exist!"});
    }
    const connection=await ConntionRequest.findOne({_id:requestId});
    if(!connection){
      return res.status(404).json({Message:"Connection not found"});
    }
    if(action_type==="accept"){
      connection.status_Accepted=true;
    }else{
      connection.status_Accepted=false;
    }
    await connection.save();
     res.json({Messahe:"Request Accepted"});
  }catch(err){
    console.log("Error during Getting My Connections!");
    res.status(500).json({Message:"Server Errror",Error:err.message});
  }
}

export const getUserProfileBasedOnUserName=async(req,res)=>{
    const {username}=req.query;
    try{
      const user=await  User.findOne({username:username});
      if(!user){
        return res.status(400).json({Message:"User not found!"});
      }

      const userProfile=await Profile.findOne({userId:user._id}).populate('userId',"name username email profilePicture");
      return res.json({"Profile":userProfile});

    }catch(err){
      console.log("Erorr during Get User Profile Based On User Profile",err.message);
      res.status(500).send(err.message);
    }
}