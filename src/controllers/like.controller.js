import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import { Tweet } from "../models/tweets.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler  from "../utils/asyncHandler.js";

// ✅
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    let isLiked = false;

    //TODO: toggle like on video
    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "VideoId is invalid");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video doesn't exist")

    const isAlreadyLiked = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id),
                    video: mongoose.Types.ObjectId.createFromHexString(videoId)
                }
            }
        ]
    )

    let like;

    if(isAlreadyLiked.length > 0 ) {
        like = await Like.findByIdAndDelete(isAlreadyLiked[0]?._id);
    } else {
        like = await Like.create({
            likedBy: req.user?._id,
            video: video._id
        })
        isLiked = true;
    }
    

    if(!like) throw new ApiError(500, "Error while toggling Video like")

    res.status(200).json(new ApiResponse(200,{ isLiked, ...like?._doc},"Successfully toggled liked for the video"));
})

// ✅
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    //TODO: toggle like on comment
    if( !commentId || !isValidObjectId(commentId)) throw new ApiError(400, "commentId is invalid");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment doesn't exist")

    let like;
    let isLiked = false;

    const isCommentAlreadyLiked = await Like.aggregate([[
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                comment: mongoose.Types.ObjectId.createFromHexString(commentId)
            }
        }
    ]])

    if(isCommentAlreadyLiked.length > 0) {
        like = await Like.findByIdAndDelete(isCommentAlreadyLiked[0]?._id);
    } else {
        like = await Like.create({
            likedBy: req.user._id,
            comment: comment._id
        })
        isLiked = true;
    }

    if(!like) throw new ApiError(500, "Error while toggling comment like")

    res.status(200).json(new ApiResponse(200, {isLiked, ...like._doc}, "Successfully liked the comment"))
})

// ✅
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    //TODO: toggle like on tweet
    if(!tweetId || !isValidObjectId(tweetId)) throw new ApiError(400, "tweetId is invalid");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "tweet doesn't exist")

    let like;
    let isLiked = false;

    const isTweetAlreadyLiked = await Like.aggregate([[
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                tweet: mongoose.Types.ObjectId.createFromHexString(tweetId)
            }
        }
    ]])

    if(isTweetAlreadyLiked.length > 0) {
        like = await Like.findByIdAndDelete(isTweetAlreadyLiked[0]?._id);
    } else {
        like = await Like.create({
            likedBy: req.user._id,
            tweet: tweet._id
        })
        isLiked = true;
    }

    

    if(!like) throw new ApiError(500, "Error while toggling tweet like")

    res.status(200).json(new ApiResponse(200, {isLiked, ...like._doc}, "Successfully liked the tweet"))
}
)

// ✅
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const allLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: {$ne: ""}
            }
        },
    ])

    res.status(200).json(new ApiResponse(200,allLikedVideos,"Successfully fetched all liked videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}