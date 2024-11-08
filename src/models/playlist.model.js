import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required:true,
        default: "New Playlist",
    },
    description: {
        type: String,
        required: true,
        default: "Description"
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

playlistSchema.methods.checkIfOwner = function(userId) {
    return JSON.stringify(userId) === JSON.stringify(this.owner)
}

export const Playlist = mongoose.model("Playlist",playlistSchema)