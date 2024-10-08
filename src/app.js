import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import morgan from "morgan";

const app = express();

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import followerRouter from "./routes/followers.routes.js";
import commentRouter from "./routes/comments.routes.js";
import likeRouter from "./routes/likes.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import chatRouter from "./routes/chats.routes.js";
import messageRouter from "./routes/messages.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/followers", followerRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

export { app };
