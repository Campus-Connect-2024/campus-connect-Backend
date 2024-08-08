import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId ID");
  }

  const like = await Like.findOne({ post: postId, likedBy: req.user._id });

  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like Removed Successfully"));
  }

  const likedPost = await Like.create({ post: postId, likedBy: req.user._id });

  return res
    .status(201)
    .json(new ApiResponse(200, likedPost, "Like Added Successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const like = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (like) {
    await like.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like Removed Successfully"));
  }

  const likedComment = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, likedComment, "Comment Added Successfully"));
});

const getLikedPosts = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likes = await Like.find({
    likedBy: req.user?._id,
    post: { $ne: null },
  }).populate("post");

  // except null extract all data from likes array
  const likedposts = likes.filter((like) => like.post).map((like) => like.post);

  if (likedposts.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "You haven't liked any Posts yet"));
  }

  // const videos = likes.map(like => like.video)
  return res
    .status(200)
    .json(new ApiResponse(200, likedposts, "Liked Posts fetched successfully"));
});

export { toggleCommentLike, togglePostLike, getLikedPosts };
