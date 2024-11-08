import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  asyncHandler from "../utils/asyncHandler.js";

// ✅
const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // check validation of videoId
  if (!videoId) throw new ApiError(400, "videoId is missing");
  const video = await Video.findById(videoId);
  
  if (!video) throw new ApiError(404, "Video doesn't exist");
  
  const comments = await Comment.aggregatePaginate([{
    $match: {
        video: mongoose.Types.ObjectId.createFromHexString(videoId)
    }
  }], { page, limit });

  res.status(200)
  .json(new ApiResponse(200,comments,"Comments fetched successfully"))
});
// ✅ check why form data not working
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const {videoId} = req.params
  const {content} = req.body

  console.log(videoId,content)
  if(!content || !videoId) throw new ApiError(400, "All fields are required");
  const video = await Video.findById(videoId);
  if(!video) throw new ApiError(404, "Video doesn't exist");

  const comment = await Comment.create({
    content,
    video: video._id,
    owner: req.user?._id
  })

  if(!comment) throw new ApiError(500, "Error while adding comment")

  res.status(200).json(new ApiResponse(200,comment,"Comment created successfully"))
});
// ✅
const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const {commentId} = req.params
  const {updatedContent} = req.body;
  if(!commentId || !updatedContent) throw new ApiError(400, "All fields are required");
  
  const comment = await Comment.findById(commentId);
  if(!comment) throw new ApiError(404, "Comment doesn't exist");

  if(!comment.checkIfOwner(req.user?._id)) throw new ApiError(402, "Comment can only be updated by its owner");

  comment.content = updatedContent;

  const newComment = await comment.save();
  if(!newComment) throw new ApiError(500, "Error while updating comment");

  res.status(200).json(new ApiResponse(200,newComment,"Comment updated successfully"))
});
// ✅
const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId) throw new ApiError(400, "All fields are required");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment doesn't exist");

    if(!comment.checkIfOwner(req.user?._id)) throw new ApiError(402, "Comment can only be updated by its owner");

    const isCommentDeleted = await comment.deleteOne();
    if(!isCommentDeleted) throw new ApiError(500, "Error while deleting comment")
    res.status(200).json(new ApiResponse(200,"Comment deleted successfully"))
});

export { getVideoComments, addComment, updateComment, deleteComment };
