import mongoose, { isValidObjectId } from "mongoose";
import { Posts } from "../models/posts.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, destroyCloudMedia } from "../utils/cloudinary.js";

const getAllPosts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 100,
    query = "",
    sortBy = "createdAt",
    sortType = -1,
    userId = "",
  } = req.query;
  var postAggregate;
  try {
    postAggregate = Posts.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                avatar: 1,
                username: 1,
              },
            },
          ],
        },
      },{
        $lookup:{
          from: "likes",
          localField : "_id",
          foreignField: "post",
          as: "likes",
        },
       },{
        $lookup:{
          from : "comments",
          localField : "_id",
          foreignField : "post",
          as : "comments",
        }
       },{
        $addFields : {
          likes : "$likes",
          comments : "$comments",
          likesCount :{
            $size : "$likes"
          },
          commentsCount: {
            $size :"$comments"
          } ,
          owner: {
            $first: "$owner",
          },
        }
       },
      {
        $sort: {
          [sortBy || "createdAt"]: sortType || -1,
        },
      },
    ]);
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Internal server error in Post aggregation"
    );
  }

  const options = {
    page,
    limit,
    customLabels: {
      totalDocs: "totalPosts",
      docs: "posts",
    },
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };

  Posts.aggregatePaginate(postAggregate, options)
    .then((result) => {
      if (result?.Posts?.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No post found"));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, result, "posts fetched successfully"));
    })
    .catch((error) => {
      throw new ApiError(
        500,
        error?.message || "Internal server error in post aggregate Paginate"
      );
    });
});

const publishAPost = asyncHandler(async (req, res) => {
  const { title = "", description = "" } = req.body;

  const mediaLocalPath = req.files?.MediaFile?.[0]?.path || "";
  if (!mediaLocalPath && !description) {
    throw new ApiError(400, "Atleast One feild is required ! ");
  }

  const media = mediaLocalPath ? await uploadOnCloudinary(mediaLocalPath) : "";
  // if (!media.url) {
  //
  // }
  // console.log(media.duration);
  if (mediaLocalPath && !media) {
    throw new ApiError(400, "Error while uploading  Media  ");
  }

  const mediaPublished = await Posts.create({
    title,
    description,
    MediaFile: {
      url: media?.secure_url || "",
      public_id: media?.public_id || "",
    },
    resourceType:media?.resource_type,
    duration: media?.duration || 0,
    owner: req.user._id,
  });
  console.log("Posted ! ");
  return res
    .status(201)
    .json(
      new ApiResponse(200, mediaPublished, " Media Published Successfully")
    );
});

const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }

  // const post = await Posts.findById(postId);
  const post = await Posts.aggregate([
     {
      $match: {
        _id: new mongoose.Types.ObjectId(postId)
      }
     },{
      $lookup:{
        from: "likes",
        localField : "_id",
        foreignField: "post",
        as: "likes",
      },
     },{
      $lookup:{
        from : "comments",
        localField : "_id",
        foreignField : "post",
        as : "comments",
      }
     },{
      $addFields : {
        likes : "$likes",
        comments : "$comments",
        likesCount :{
          $size : "$likes"
        },
        commentsCount: {
          $size :"$comments"
        } ,
      }
     },{
      $project: {
        MediaFile : 1,
        title : 1,
        description: 1,
        duration : 1,
        views : 1,
        isPublished: 1,
        owner : 1,
        createdAt : 1,
        updatedAt : 1,
        likesCount : 1 ,
        commentsCount : 1 ,
        likes : 1,
        comments : 1,
      }
     }
  ]);


  // console.log(post)
  if (!post) {
    throw new ApiError(404, " Post not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, post, " Post Feched Successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const UpdatedPostData = {
    title: req.body?.title || "",
    description: req.body?.description || "",
  };

  const post = await Posts.findById(postId);
  if (!post) {
    throw new ApiError(404, "post not found !");
  }
  if (JSON.stringify(post.owner) !== JSON.stringify(req.user._id)) {
    throw new ApiError(403, "You are Not authorized to do this ");
  }

  if (req.file?.path !== "") {
    post.MediaFile.public_id
      ? await destroyCloudMedia(post.MediaFile.public_id)
      : "";
  }

  const MediaLocalPath = req.file?.path || "";
  // console.log(MediaLocalPath+" this is ")
  if (!MediaLocalPath && !UpdatedPostData.description) {
    throw new ApiError(400, "Atleast One feild is required ! ");
  }
  // if (!MediaLocalPath) {
  //   throw new ApiError(400, "Media file is missing");
  // }

  const mediaUpload = MediaLocalPath
    ? await uploadOnCloudinary(MediaLocalPath)
    : "";

  if (MediaLocalPath && !mediaUpload) {
    throw new ApiError(400, "Error while uloading media");
  }

  UpdatedPostData.MediaFile = {
    url: mediaUpload?.url || "",
    public_id: mediaUpload?.public_id || "",
  };

  const updatedPostDetails = await Posts.findByIdAndUpdate(
    postId,
    UpdatedPostData,
    {
      new: true,
    }
  );
  console.log("Updated Post ! ");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPostDetails,
        "Post Details Updated Successfully"
      )
    );
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId ID");
  }

  const post = await Posts.findById(postId);
  if (!post) {
    throw new ApiError(404, "post not found !");
  }

  if (JSON.stringify(post.owner) !== JSON.stringify(req.user._id)) {
    throw new ApiError(403, "You are Not authorized to do this ");
  }

  post.MediaFile.public_id != ""
    ? await destroyCloudMedia(post.MediaFile.public_id)
    : "";

  await Posts.findByIdAndDelete(postId);
  console.log("Deleted Post ! ");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const post = await Posts.findById(postId);

  if (!post) {
    throw new ApiError(404, "post not found !");
  }

  if (JSON.stringify(post.owner) !== JSON.stringify(req.user._id)) {
    throw new ApiError(403, "You are Not authorized to do this ");
  }
  // Toggle the isPublish field
  post.isPublished = !post.isPublished;

  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, post, "isPublished toggle Successfully"));
});


export {
  getAllPosts,
  publishAPost,
  getPostById,
  updatePost,
  deletePost,
  togglePublishStatus,
};
