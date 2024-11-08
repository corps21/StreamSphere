import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler  from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

// ✅
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    if(!userId || !isValidObjectId(userId)) throw new ApiError(400, "Invalid UserId")
    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User doesn't exist")
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.aggregatePaginate(
        [
            {
                $match: {
                    owner: mongoose.Types.ObjectId.createFromHexString(userId)
                }
            }
        ],
        {
            page,
            limit,
            sort: [[sortBy,sortType]],
            countQuery: query
        }
    )

    res.status(200).json(new ApiResponse(200, videos, "Successfully fetched all the videos"))
})

// ✅
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description) throw new ApiError(400, "All fields are required");
    
    let videoFilePath;
    let thumbnailFilePath; 
    if(
        req.files && 
        Array.isArray(req.files["videoFile"]) && 
        Array.isArray(req.files['thumbnail']) && 
        req.files["videoFile"].length > 0 && 
        req.files["thumbnail"].length > 0
    ) 
    {
        videoFilePath = req.files["videoFile"][0].path;
        thumbnailFilePath = req.files["thumbnail"][0].path;
    }

    console.log(videoFilePath)
    console.log(thumbnailFilePath)

    if(!videoFilePath) throw new ApiError(500, "Error while fetching video file path")
    if(!thumbnailFilePath) throw new ApiError(500, "Error while fetching thumbnail file path");

    const videoFile = await uploadOnCloudinary(videoFilePath,"video");

    if(!videoFile) throw new ApiError(500, "Error while uploading VideoFile");

    const thumbnailFile = await uploadOnCloudinary(thumbnailFilePath);
    if(!thumbnailFile) throw new ApiError(500, "Error while uploading ThumbnailFile")

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        owner: req.user?._id,
        title,
        description
    })

    if(!video) throw new ApiError(500, "Error while creating video document");

    res.status(200).json(new ApiResponse(200,video,"Successfully created Video Document"))
})
// ✅
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid VideoId")
    
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video doesn't exist");

    res.status(200).json(new ApiResponse(200,video,"Successfully fetched Video document"))
})

// ✅
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid VideoId")
    
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video doesn't exist");
    
    const isOwner = video.checkIfOwner(req.user?._id);
    if(!isOwner) throw new ApiError(402, "Only owner can delete the video")
        
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body;
    if(!title || !description) throw new ApiError(400, "All field are required");
    
    let thumbnailFilePath = req?.file.path;

    if(!thumbnailFilePath) throw new ApiError(500, "Error while fetching thumbnail file path")
    
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    if(!thumbnail) throw new ApiError(500, "Error while uploading thumbnail");

    const newVideo = await Video.findByIdAndUpdate(video._id,{title,description,thumbnail: thumbnail.url},{new:true});

    if(!newVideo) throw new ApiError(500, "Error while updating video document")

    res.status(200).json(new ApiResponse(200, newVideo, "Successfully updated video document"))
})
// ✅
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid VideoId")
    
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video doesn't exist");

    const isOwner = video.checkIfOwner(req.user?._id);
    if(!isOwner) throw new ApiError(402, "Only owner can delete the video")
    
    const isVideoDeleted = await video.deleteOne();
    if(!isVideoDeleted) throw new ApiError(500, "Error while deleting video");
    
    res.status(200).json(new ApiResponse(200,{},"Successfully deleted Video"));
})

// ✅
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid VideoId")
    
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video doesn't exist");

    const isOwner = video.checkIfOwner(req.user?._id);
    if(!isOwner) throw new ApiError(402, "Only owner can toggle status of the video")

    video.isPublished = !video.isPublished;

    const newVideo = await video.save();
    if(!newVideo) throw new ApiError("Error while updating video document")

    res.status(200).json(new ApiResponse(200,newVideo,"Successfully toggled status of the video"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}