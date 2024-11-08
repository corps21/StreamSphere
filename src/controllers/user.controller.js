import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  )
    throw new ApiError(400, "All fields are required");

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(400, "User Already Exists");

  const localAvatarPath = req.files?.avatar[0].path;
  if (!localAvatarPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(localAvatarPath);
  if (!avatar) throw new ApiError(500, "Error while uploading Avatar");

  let localCoverImagePath;

  if (
    req.files &&
    Array.isArray(req.files?.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    localCoverImagePath = req.files.coverImage[0].path;
  }

  const coverImage = await uploadOnCloudinary(localCoverImagePath);

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "Error while creating new user");

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "Successfully registered!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(401, "Password is incorrect");

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user._id
  );
  const options = {
    secure: true,
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "User logged In"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  await User.findByIdAndUpdate(user?._id,{
    $unset: {
      refreshToken:1
    }
  })
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User Logged Out successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName && !email)
    throw new ApiError(400, "FullName or Email is required");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      fullName: fullName || req.user.fullName,
      email: email || req.user.email,
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(500, "Error while updating the user");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully updated the user"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path || null;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");
  const newAvatar = await uploadOnCloudinary(avatarLocalPath);
  if (!newAvatar) throw new ApiError(500, "Error while uploading new Avatar");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: newAvatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(500, "Error while updating avatar url");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully updated avatar"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path || null;
  if (!coverImageLocalPath) throw new ApiError(400, "Cover Image is required");
  const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!newCoverImage)
    throw new ApiError(500, "Error while uploading new Cover Image");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: newCoverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(500, "Error while updating Cover Image url");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully updated Cover Image"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError(400, "All field are required");
  const user = await User.findById(req?.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "Password is incorrect");
  user.password = newPassword;
  const isPasswordChanged = await user.save({ validateBeforeSave: false });
  if (!isPasswordChanged)
    throw new ApiError(500, "Error occured while changing to new password");

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully changed the password"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(404, "LoggedIn User Not Found");
  res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully fetched current user"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.body.refreshToken || req.cookies.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(402, "No Token Recieved");

  const decodedToken = await jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!decodedToken) throw new ApiError(402, "Invalid Refresh Token");

  const user = await User.findById(decodedToken?._id);
  if (!user)
    throw new ApiError(402, "User not found from decoded recieved token");

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user._id
  );
  user.refreshToken = refreshToken;

  const isUserSaved = await user.save({ validateBeforeSave: false });
  if (!isUserSaved)
    throw new ApiError(500, "Error while saving new refreshToken");

  const options = {
    secure: true,
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200, {}, "Successfully Refreshed Tokens"));
});

const getChannelUserProfile = asyncHandler(async(req,res) =>{
  const channelName = req.params?.username;
  const channel = await User.aggregate([
    {
      $match: {
        username: channelName?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribedFrom"
      }
    }
    ,
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribedFrom"
        },
        subscribedToCount: {
          $size: "$subscribedTo"
        },
        isUserSubscribed: {
          if: {$in: [req.user?.id, "$subscribedFrom.subscriber"]},
          then: true,
          else: false
        }
      }
    }
  ])
})

const getUserWatchHistory = asyncHandler(async (req,res) => {
  const user = req.user;
  const watchHistory = await User.aggregate([
    {
      $match: {
        _id: new moongoose.Types.ObjectId(req.user._id)
      }
    },{
      $lookup: {
        from: "videos",
        localField:"watchHistory",
        foreignField: "_id",
        as: "watchedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "owner"
              }
            }
          }
        ]
      }
    }
  ])
})

export {
  registerUser,
  loginUser,
  logoutUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  changePassword,
  getCurrentUser,
  refreshAccessToken,
  getChannelUserProfile,
  getUserWatchHistory
};
