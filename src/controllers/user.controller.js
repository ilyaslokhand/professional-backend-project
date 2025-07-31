import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import apiError from "../utils/apiErrors.js";
import UploadOnCloudinary from "../utils/cloudanary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import getCloudinaryPublicId from "../utils/getCloudinaryPublicId.js";
import mongoose from "mongoose";

// create a separte method fo parsing the acccess and refresh token

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const existedUser = await User.findById(userId);
    const accessToken = existedUser.generateAccessToken();
    const refreshToken = existedUser.refreshAccessToken();
    // save the refresh token in db
    existedUser.refreshToken = refreshToken;
    await existedUser.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Something went wrong while generating tokens");
  }
};

// const registerUser = asyncHandler(async (req, res) => {
// get user details from frontend
// validation - not empty
// check id user already exists : user or email
// files exists or not. avatar/coverimage
// available then upload to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token from response
// check for user creattion
// send response to frontend & if not created send error

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, email, fullName, Password } = req.body;
  
  if (!username || !email || !fullName || !Password) {
    throw new apiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User already exists with this username or email");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; // upload on localserver
  // const coverImageLocalPath = req.files?.coverImage[0]?.path; // upload on localserver
   console.log("avatarlocalpath", avatarLocalPath)
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  }

  const avatar = await UploadOnCloudinary(avatarLocalPath);
  const coverImage = await UploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new apiError(400, "Avatar is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
    email,
    Password,
    fullName,
  });

  const createdUser = await User.findById(user._id).select(
    "-Password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new apiResponse(createdUser, 200, "User registered successfully"));
});

// take the details from res.body
// username, email,
// validate if already exists
// passsword check
// send access and refresh token
// send cookie
// send response

const loginUser = asyncHandler(async (req, res) => {
  const { username, Password, email } = req.body;
  if (!(username || email)) {
    throw new apiError(400, "Username or email are required");
  }
  const existedUser = await User.findOne({
    $or: [
      ...(username ? [{ username: username.toLowerCase() }] : []),
      ...(email ? [{ email }] : []),
    ],
  });
  if (!existedUser) {
    throw new apiError(404, "User not found with this username or email");
  }
  const isPasswordValid = await existedUser.isValidatePassword(Password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid password");
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(existedUser._id);

  const loggedInUser = await User.findById(existedUser._id).select(
    "-Password -refreshToken"
  );
  if (!loggedInUser) {
    throw new apiError(500, "Something went wrong while logging in user");
  }

  // to send cookies we need to define some options

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        { user: loggedInUser, accessToken, refreshToken }, // ← data first
        200,
        "User logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse("", 200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized Request");
  }

  const decodedRefreshToken = jwt.verify(
  incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
);


  const existedUser = await User.findById(decodedRefreshToken?._id);

  if (!existedUser) {
    throw new apiError(401, "invalid refresh token");
  }

  if (incomingRefreshToken !== existedUser?.refreshToken) {
    throw new apiError(401, "Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(existedUser._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(200, accessToken, refreshToken, "Access Token Refreshed")
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const existedUser = await User.findById(req.user?._id);
  const isPasswordValid = await existedUser.isValidatePassword(oldPassword);
  if (!isPasswordValid) {
    throw new apiError(400, "Invalid old password");
  }

  existedUser.Password = newPassword;
  await existedUser.save({ validateBeforeSave: false });

  return res
    .statue(200)
    .json(new apiResponse({}, 200, "Password changed succesfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(req.user, 200, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;

  if (!email && !fullName) {
    throw new apiError(400, "At least one field is required to update");
  }
  const updateData = {};
  if (email) updateData.email = email;
  if (fullName) updateData.fullName = fullName;

  const updatedUser = User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateData },
    { new: true }
  ).select("-Password -refreshToken");

  if (!updatedUser) {
    throw new apiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new apiResponse(updatedUser, 200, "User account updated successfully")
    );
});

const updateAvatarLocalPath = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "avatar file is missing");
  }

  const currentUser = await User.findById(req.user?._id);
  const OldavatarUrl = currentUser?.avtar;

  const avatar = await UploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new apiError(400, "error while uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-Password");

  try {
    fs.unlinkSync(avatarLocalPath);
  } catch (error) {
    console.error("Error deleting local avatar file:", error.message);
  }

  if (OldavatarUrl) {
    try {
      const publicId = getCloudinaryPublicId(OldavatarUrl.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "auto",
        });
      }
    } catch (error) {
      throw new apiError(
        500,
        "Error while deleting old avatar image from cloudinary"
      );
    }
  }

  return res
    .status(200)
    .json(
      new apiResponse(updatedUser, 200, "avatar image updated succesfully")
    );
});

const updatecoverImageLocalPath = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new apiError(400, "cover image file is missing");
  }

  const currentUser = await User.findById(req.user?._id);
  const OldcoverImageUrl = currentUser?.coverImage;

  const coverImage = await UploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new apiError(400, "error while uploading cover Image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-Password");

  try {
    fs.unlinkSync(coverImageLocalPath);
  } catch (error) {
    console.error("Error deleting local avatar file:", error.message);
  }

  if (OldcoverImageUrl) {
    try {
      const publicId = getCloudinaryPublicId(OldcoverImageUrl.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "auto",
        });
      }
    } catch (error) {
      throw new apiError(
        500,
        "Error while deleting old cover image from cloudinary"
      );
    }
  }

  return res
    .status(200)
    .json(new apiResponse(updatedUser, 200, "cover image updated succesfully"));
});

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params;
   if(!username?.trim()){
    throw new apiError(400, "username is missing");
   }

  const channel =  await User.aggregate([{
    $match:{
      username: username?.toLowerCase(),
    }
  },

  {
    $lookup:{
      from: "subscriptions", // Subscription change to  subscriptions as mongodb name is plural in db
      localField: "_id",
      foreignField: "channel",
      as: "subscribers",
    }
  },

  {
    $lookup:{
      from: "subscriptions",
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo", // how many channels i have subscribed to
    }
  },

  {
  $addFields: {
    subscriberscount: { $size: "$subscribers" }, //count of subscribers
    subscribedToCount: { $size: "$subscribedTo" }, //count of channels subscribed to
    isSubscribed: {
      $cond: {
        if: { $in: [req.user._id, "$subscribers.subscriber"] },  // / check if the currenr user is subscribed to the channel
        then: true,
        else: false
      }
    }
  }
},
  {
    $project:{
      fullName:1,
      username:1,
      avatar:1,
      coverImage:1,
      subscriberscount:1,
      subscribedToCount:1,
      isSubscribed:1,
    }
  }

])
console.log("channel", channel);
  
  if(!channel?.length){
    throw new apiError(404, "Channel not found");
  }

  return res.status(200).json(
    new apiResponse(channel[0], 200, "User channel profile fetched successfully")
  )

});

const getWatchHistory = asyncHandler(async(req,res)=>{
  const currentUser = await User.aggregate([
    {
      $match: {_id: new ObjectId(req.user._id)} // we write objectid bbecause here mongoose not work internally inside pipeline
    },

    {
      $lookup:{
       from: "videos",
       localField:"WatchHistory",
       foreignField: "_id",
       as: "watchHistoryVideos",
       pipeline:[
        {
          $lookup:{
            from: "users",
            localField: "videoOwner",
            foreignField: "_id",
            as: "videoOwnerDetails",
            pipeline:[
              {
                $project:{
                  fullName:1,
                  username:1,
                  avatar:1,
                  coverImage:1,
                }
              }
            ]
          }
        }
       ]
      }
    }
  ]);
   console.log("currentUser", currentUser);
  if(!currentUser?.length){
    throw new apiError(404, "user not found");
  };

  return res.status(200).json(
    new apiResponse(currentUser[0].watchHistoryVideos,200, "user watch history fetched successfully")
  )

})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarLocalPath,
  updatecoverImageLocalPath,
  getUserChannelProfile,
  getWatchHistory
};
