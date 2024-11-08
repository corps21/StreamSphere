import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler  from "../utils/asyncHandler.js";

// ✅
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId || !isValidObjectId(channelId)) throw new ApiError(400, "channelId is invalid");

    const channel = await User.findById(channelId);
    if(!channel) throw new ApiError(404, "Channel doesn't exist")

    const isAlreadySubscribed = await Subscription.aggregate(
        [
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(req.user?._id),
                    channel: mongoose.Types.ObjectId.createFromHexString(channelId)
                }
            }
        ]
    )

    let subscription;
    let isSubscribed = false;

    if(isAlreadySubscribed.length > 0 ) {
        subscription = await Subscription.findByIdAndDelete(isAlreadySubscribed[0]?._id);
    } else {
        subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channel._id
        })
        isSubscribed = true;
    }

    if(!subscription) throw new ApiError(500, "Error while toggling subscription")

    res.status(200).json(new ApiResponse(200,{ isSubscribed, ...subscription?._doc},"Successfully toggled liked for the video"));
})

// ✅
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!subscriberId || !isValidObjectId(subscriberId)) throw new ApiError(400, "subscriberId is invalid");

    const channel = await User.findById(subscriberId);
    if(!channel) throw new ApiError(404, "Channel doesn't exist")
    
    const allChannels = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: mongoose.Types.ObjectId.createFromHexString(subscriberId)
                }
            },
            {
                $group: {
                    _id: null,
                    subscribers: {
                        $push:"$subscriber"
                    }
                }
            },
            {
                $project: {
                    _id:0,
                    subscribers:1
                }
            }
        ]
    )

    res.status(200).json(new ApiResponse(200, allChannels[0]["subscribers"], "Successfully fetched all susbscibers"))

})

// controller to return channel list to which user has subscribed
// ✅
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if(!channelId || !isValidObjectId(channelId)) throw new ApiError(400, "channelId is invalid");

    const user = await User.findById(channelId);
    if(!user) throw new ApiError(404, "user doesn't exist")
    
        const allChannels = await Subscription.aggregate(
            [
                {
                    $match: {
                        subscriber: mongoose.Types.ObjectId.createFromHexString(channelId)
                    }
                },
                {
                    $group: {
                        _id: null,
                        channels: {
                            $push:"$channel"
                        }
                    }
                },
                {
                    $project: {
                        _id:0,
                        channels:1
                    }
                }
            ]
        )
    
        res.status(200).json(new ApiResponse(200, allChannels[0]["channels"], "Successfully fetched all susbscriptions"))
    
    
    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}