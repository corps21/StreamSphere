import mongoose, { isValidObjectId } from "mongoose";
import {Video} from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description} = req.body;
  if (!name || !description) throw new ApiError(400, "All fields are required");

  //TODO: create playlist
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!playlist) throw new ApiError(500, "Error while creating the playlist");

  res.status(200).json(new ApiResponse(200, playlist, "Successfully created the playlist"));
});

// ✅
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId || !isValidObjectId(userId)) throw new ApiError(400, "Invalid userId");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User doesn't exist");

  const userPlaylists = await Playlist.aggregate([
    {
        $match: {
            owner: mongoose.Types.ObjectId.createFromHexString(userId)
        }
    }
  ]);

  res.status(200).json(new ApiResponse(200,userPlaylists, "Successfully fetched user playlists"));
});

// ✅
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId || !isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlistId");

  const playlist = await Playlist.findById(playlistId);

  if(!playlist) throw new ApiError(404, "Playlist doesn't exist")

  res.status(200).json(new ApiResponse(200, playlist, "Successfully fetched playlist"))
});

// ✅
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if(!playlistId || !isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlistId");
  if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid VideoId")

  const video = await Video.findById(videoId);
  if(!video) throw new ApiError(404, "Video doesn't exist");

  const playlist = await Playlist.findById(playlistId)
  if(!playlist) throw new ApiError(404, "Playlist doesn't exist")

  if(!playlist.checkIfOwner(req.user?._id)) throw new ApiError(402, "Only owner can add video to playlist")

  playlist.videos = [...playlist.videos, video._id]
  const isAdded = await playlist.save();
  if(!isAdded) throw new ApiError(500, "Error while adding video to the playlist")

  const newPlaylist = await Playlist.findById(playlistId)
  if(!newPlaylist) throw new ApiError(500, "Error while fetching new playlist")

  res.status(200).json(new ApiResponse(200, newPlaylist, "Successfully added video to the playlist"));
});
// ✅
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if(!playlistId || !isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlistId");
  if(!videoId || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid VideoId")

  const video = await Video.findById(videoId);
  if(!video) throw new ApiError(404, "Video doesn't exist");
  
  const playlist = await Playlist.findById(playlistId)
  if(!playlist) throw new ApiError(404, "Playlist doesn't exist")
  
  if(!playlist.checkIfOwner(req.user?._id)) throw new ApiError(402, "Only owner can remove video to playlist")
  
  playlist.videos = playlist.videos.filter((video) => JSON.stringify(video._id) !== JSON.stringify(videoId));

  const isRemoved = await playlist.save();
  if(!isRemoved) throw new ApiError(500, "Error while adding video to the playlist")

    const newPlaylist = await Playlist.findById(playlistId)
    if(!newPlaylist) throw new ApiError(500, "Error while fetching new playlist")
  
    res.status(200).json(new ApiResponse(200, newPlaylist, "Successfully remove video from the playlist"));
});
// ✅
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if(!playlistId || !isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlistId");

  const playlist = await Playlist.findById(playlistId);
  if(!playlist) throw new ApiError(404, "Playlist doesn't exist")

  if(!playlist.checkIfOwner(req.user?._id)) throw new ApiError(402, "Only owner can delete playlist")
  
  const isDeleted = await playlist.deleteOne();
  if(!isDeleted) throw new ApiError(500, "Error while deleting playlist")

  res.status(200).json(new ApiResponse(200,isDeleted,"Successfully deleted the playlist"))
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!name || !description) throw new ApiError(400, "All fields are required");
  if(!playlistId || !isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlistId");

  const playlist = await Playlist.findById(playlistId);
  if(!playlist) throw new ApiError(404, "Playlist doesn't exist")

  if(!playlist.checkIfOwner(req.user?._id)) throw new ApiError(402, "Only owner can delete playlist")
  
  playlist.name = name;
  playlist.description = description;

  const isUpdated = await playlist.save();
  if(!isUpdated) throw new ApiError(500, "Error while updating playlist")

    const newPlaylist = await Playlist.findById(playlistId)
  if(!newPlaylist) throw new ApiError(500, "Error while fetching new playlist")

  res.status(200).json(new ApiResponse(200, newPlaylist, "Successfully updated the playlist"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
