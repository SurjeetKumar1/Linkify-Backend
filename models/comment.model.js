import mongoose, { mongo } from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: {
    //kisne bheja comment
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    //kis post par comment kiya
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
