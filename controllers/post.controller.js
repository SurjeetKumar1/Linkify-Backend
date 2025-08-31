import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Post from "../models/post.model.js"
import Comment from "../models/comment.model.js"

export const activeCheck=async(req,res)=>{
    return res.send({message:"Running"})
}

export const createdPost=async(req,res)=>{
    const {token}=req.body;
    try{
        const user=await User.findOne({token});
        if(!user){
            return res.status(404).json({Message:"User Not Found!"});
        }

        const createPost=new Post({
            userId:user._id,
            body:req.body.body,
            media:req.file!=undefined?req.file.filename:"",
            fileType:req.file!=undefined?req.file.mimetype.split("/")[1]:"",
        })

        await createPost.save();
        return res.status(200).json({message:"Post Created!"});

    }catch(err){
        console.log("Error during create post",err);
        res.status(500).json({Message:"Error during Create Post!",Error:err.message});
    }
}

export const getAllPosts=async(req,res)=>{
    try{
        const post=await Post.find({}).populate('userId', 'name email username profilePicture');
        res.json({post});

    }catch(err){
        console.log("Error during Geeting all post");
        res.status(500).json({Message:err.message});
    }
}

export const deleletPost=async(req,res)=>{
    const {token,post_id}=req.body;
    try{
        const user=await User.findOne({token}).select("_id");
        if(!user){
            return res.status(404).json({Message:"User Not Found!"});
        }

        const post=await Post.findOne({_id:post_id});
        if(!post){
            return res.status(404).json({Message:"Post not foun!"});
        }

        if(post.userId.toString()!==user._id.toString()){
            return res.status(401).json({Message:"You have not permission to delete this post!"});
        }

        await Post.deleteOne({_id:post_id});
        res.send({Message:"Post Deleted Successfully!"});

    }catch(err){
        console.log("Error during create post");
        res.status(500).json({Message:"Error during deleting Post!",Error:err.message});
    }
}

export const commentsPost=async(req,res)=>{
        const {token,post_id,commentBody}=req.body;
        try{
         const user=await User.findOne({token:token}).select("_id");
         if(!user){
            return res.status(404).json({Message:"User Not Found!"});
        }
        const post=await Post.findOne({_id:post_id});

        if(!post){
            return res.status(404).json({Message:"Post not found!"});
        }
        const newComment=new Comment({
            userId:user._id,
            postId:post._id,
            comment:commentBody
        })

        await newComment.save();
        res.json({Message:"Comment Sucessfull !"});
        }catch(err){
            console.log("Error during create post");
            res.status(500).json({Message:"Error during Commenting the Post!",Error:err.message});
        }
}


export const getCommentsByPost=async(req,res)=>{
        const {post_id}=req.query;
        try{
        const post=await Post.findOne({_id:post_id});
        if(!post){
            return res.status(404).json({Message:"Post not Found"});
        } 
        const comments=await Comment.find({postId:post_id}).sort({ createdAt: -1 }).populate("userId", "username name profilePicture");
        res.json({comments});
        // return res.json({comments:post.comments.reverse()})
    
        }catch(err){
            console.log("Error during create post");
            res.status(500).json({Message:"Error during Create Post!",Error:err.message});
        }
}

export const deleteCommentOfUser=async(req,res)=>{
        const {token,comment_id}=req.body;
        try{
            const user=await User.findOne({token:token}).select("_id");
            if(!user){
               return res.status(404).json({Message:"User Not Found!"});
           }
           const comment=await Comment.findOne({"_id":comment_id});
           if(!comment){
            return res.status(404).json({Message:"Comment not found"});
           }

           if(comment.userId.toString()!==user._id.toHexString())
           {
            return res.status(401).json({Message:"You don't have a permission to delete the comment!"})
           }

           await Comment.deleteOne({_id:comment_id});
           res.json({Message:"Comment deleted successfully"})
    
        }catch(err){
            console.log("Error during create post");
            res.status(500).json({Message:"Error during Create Post!",Error:err.message});
        }
}


export const increment_likes = async (req, res) => {
    const { post_Id ,userId} = req.body;

    try {
        const post = await Post.findById(post_Id);
        if (!post) {
            return res.status(404).json({ Message: "Post not found!" });
        }

        const alreadyLiked = post.likedBy.includes(userId);

        if (alreadyLiked) {
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
            post.likes = post.likes - 1;
            await post.save();
            return res.json({ Message: "Post unliked successfully!", likes: post.likes });
        } else {
            post.likedBy.push(userId);
            post.likes = post.likes + 1;
            await post.save();
            return res.json({ Message: "Post liked successfully!", likes: post.likes });
        }

    } catch (err) {
        console.error("Error during toggle like:", err);
        res.status(500).json({ Message: "Error during toggle like!", Error: err.message });
    }
};

