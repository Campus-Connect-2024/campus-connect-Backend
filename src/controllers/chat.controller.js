import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chats.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      // res.status(200).json(FullChat);
      return res
        .status(200)
        .json(new ApiResponse(200, FullChat, "Accesed Chat Succesfully "));
    } catch (error) {
      throw new ApiError(
        400,
        error.message || "Internal server error while Accessing All chats "
      );
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        //   res.status(200).send(results);
        return res
          .status(200)
          .json(new ApiResponse(200, results, "Fetched All chats succefully "));
      });
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "Internal server error while Fetching chats "
    );
  }
});

export { accessChat, fetchChats };
