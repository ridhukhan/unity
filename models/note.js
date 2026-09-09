import mongoose from "mongoose";


const noteSchema = new mongoose.Schema({


    text:{
        type:String,
    }
})

export default mongoose.models.Note || mongoose.model("Note",noteSchema)