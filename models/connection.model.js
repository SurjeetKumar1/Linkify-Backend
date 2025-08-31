import mongoose, { mongo } from "mongoose";

const conntionRequestSchema=new mongoose.Schema({
    userId:{                                 //kisne bheja
   type:mongoose.Schema.Types.ObjectId,
   ref:"User"
    },
    connectionId:{                           //kisko bheja 
       type:mongoose.Schema.Types.ObjectId,
   ref:"User"
    },
    status_Accepted:{             //acceptd,rejected,wait 
      type:Boolean,
      default:null
    },
})

const ConnetionRequest=mongoose.model("ConnetionRequest",conntionRequestSchema);
export default ConnetionRequest;