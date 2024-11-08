import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

// ✅
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!content) throw new ApiError(400, "All fields are required");

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content
    })

    if(!tweet) throw new ApiError(500, "Error while creating tweet");

    res.status(200).json(new ApiResponse(200, tweet, "Successfully created the tweet"));
})

// ✅
const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!userId || !isValidObjectId(userId)) throw new ApiError(400, "Invalid UserId")

    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User doesn't exist")

    const allTweets = await Tweet.aggregate(
        [
            {
                $match: {
                    owner: mongoose.Types.ObjectId.createFromHexString(userId)
                }
            }
        ]
    )

    res.status(200).json(new ApiResponse(200, allTweets, "Successfully fetched all the user tweets"))
})

// ✅
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    if(!content) throw new ApiError(400, "All fields are required");
    if(!tweetId || !isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet Id");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet doesn't exist");

    if(!tweet.checkIfOwner(req.user?._id)) throw new ApiError(402, "Only owner can delete tweet")
    
    const newTweet = await Tweet.findByIdAndUpdate(tweet, {
        content
    }, {new : true})
    if(!newTweet) throw new ApiError(500,"Error while updating")

    res.status(200).json(new ApiResponse(200, newTweet, "Successfully updated the tweet"));
})

// ✅
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if(!tweetId || !isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet Id");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet doesn't exist");

    if(!tweet.checkIfOwner(req.user?._id)) throw new ApiError(402, "Only owner can delete tweet")

    const isTweetDeleted = await tweet.deleteOne();
    if(!isTweetDeleted) throw new ApiError(500, "Error while deleting the tweet")

    res.status(200).json(new ApiResponse(200,{},"Successfully deleted the tweet"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}