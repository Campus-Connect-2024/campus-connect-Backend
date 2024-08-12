import mongoose, { isValidObjectId } from "mongoose";
import { Followers } from "../models/followers.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const toggleFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const followingCheck = await Followers.findOne({
    owner: userId,
    follower: req.user?._id,
  });

  if (followingCheck) {
    await followingCheck.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Following Removed Successfully"));
  }

  const createFollowing = await Followers.create({
    owner: userId,
    follower: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createFollowing,
        "Congratulation! You have Successfully followed this user"
      )
    );
});

const getUserFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const followers = await Followers.find({ owner: userId }).populate(
    "follower",
    "fullName email username avatar coverImage"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { followers }, "followers are fetched successfully")
    );
});

const getFollowedUsers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId id");
  }

  const followedUsers = await Followers.find({ follower: userId }).populate(
    "owner",
    "fullName email username avatar coverImage"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { followedUsers },
        "Followers are fetched successfully"
      )
    );
});

export { toggleFollowing, getUserFollowers, getFollowedUsers };
