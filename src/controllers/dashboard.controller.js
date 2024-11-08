import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler  from "../utils/asyncHandler.js";

// ✅
const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const totalInfo = {};

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user?._id)
      },
    },
    {
      $count: "totalSubscriberCount",
    },
  ]);

  if (totalSubscribers.length <= 0)
    throw new ApiError(500, "Error while fetching totalSubscribers");

  totalInfo.totalSubscribers = totalSubscribers[0]?.totalSubscriberCount;

  const totalVideoInfo = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user?._id) } },
    {
      $facet: {
        totalVideoViews: [
          {
            $group: {
              _id: null,
              totalViews: {
                $sum: "$views",
              },
            },
          },
          {
            $project: {
              totalViews: 1,
            },
          },
        ],
        totalVideosCount: [
          {
            $count: "totalVideos",
          },
        ],
      },
    },
    {
      $project: {
        totalVideoViews: {
          $arrayElemAt: ["$totalVideoViews.totalViews", 0],
        },
        totalVideosCount: {
          $arrayElemAt: ["$totalVideosCount.totalVideos", 0],
        },
      },
    },
  ]);

  if (totalVideoInfo.length <= 0)
    throw new ApiError(500, "Error while fetching totalVideoInfo");

  totalInfo.totalVideoViews = totalVideoInfo[0]?.totalVideoViews;
  totalInfo.totalVideosCount = totalVideoInfo[0]?.totalVideosCount;

  const totalLikeInfo = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    { $count: "totalLikes" },
  ]);

  if (totalLikeInfo.length <= 0)
    throw new ApiError(500, "Error while fetching totalLikeInfo");

  totalInfo.totalLikesCount = totalLikeInfo[0]?.totalLikes;

  res
    .status(200)
    .json(new ApiResponse(200, totalInfo, "Successfully fetched data"));
});

// ✅
const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  
  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200,totalVideos,"Successfully fetched data"))
});

export { getChannelStats, getChannelVideos };