import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId ID");
  }

  const skip = (page - 1) * limit;
  const comments = await Comment.find({ post: postId }).skip(skip).limit(limit).populate("owner", "_id username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Fetch All Comments Successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  console.log(req.params, req.body);
  const { postId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId ID");
  }

  const comment = await Comment.create({
    post: postId,
    content: content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment Published Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (!content) {
    throw new ApiError(400, "content is not filled");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found ");
  }
  if (JSON.stringify(req.user._id) !== JSON.stringify(comment.owner)) {
    throw new ApiError(403, "you are not authorized to do this ");
  }

  const updateCommentContent = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!updateCommentContent) {
    throw new ApiError(400, "comment not found or invalid comment id");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateCommentContent, "Comment Updated Successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found ");
  }
  if (JSON.stringify(req.user._id) !== JSON.stringify(comment.owner)) {
    throw new ApiError(403, "you are not authorized to do this ");
  }

  await Comment.findByIdAndDelete({ _id: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Deleted Successfully"));
});

export { getPostComments, addComment, updateComment, deleteComment };
