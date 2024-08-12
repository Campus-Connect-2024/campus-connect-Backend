import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chats.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/messages.model.js";
import { ApiError } from "../utils/ApiError.js";

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params?.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res
      .status(200)
      .json(new ApiResponse(200, messages, "Get all mesaages successfully "));
  } catch (error) {
    throw new ApiError(
      400,
      error.message || "Internal server error while Fetching messages "
    );
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    throw new ApiError(
      400,
      error.message || "Invalid data passed into request "
    );
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res
      .status(200)
      .json(new ApiResponse(200, message, "Message Sent succefully "));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Internal server error while sending message  "
    );
  }
});

export { allMessages, sendMessage };
