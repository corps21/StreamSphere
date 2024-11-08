import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema = new Schema({
    videoFile: {
        type: String,
        required:true
    },
    thumbnail: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    title: {
        type:String,
        required:true
    },
    description: {
        type:String,
        required:true
    },
    duration: {
        type:Number,
        default:0
    },
    views: {
        type:Number,
        default:0
    },
    isPublished: {
        type:Boolean,
        default:true
    },
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);

videoSchema.methods.checkIfOwner = function(userId) {
    return JSON.stringify(userId) === JSON.stringify(this.owner)
}

export const Video = mongoose.model("Video",videoSchema);