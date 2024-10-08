import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import cluster from "cluster";
import os from "os";
import logger from "./utils/logger.js";
dotenv.config({
  path: "./.env",
});

// Number of CPU cores
const numCPUs = Math.min(os.cpus().length,8);
if (cluster.isMaster) {
  // Master process
  logger.info(`Master ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker on exit
  cluster.on("exit", (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // Worker process
  connectDB()
    .then(() => {
      // Start the server
      const server = app.listen(process.env.PORT || 8000, () => {
        logger.info(`⚙️   Worker ${process.pid} running server on port ${process.env.PORT}`);
      });

      // Setup Socket.IO
      const io = new Server(server, {
        pingTimeout: 60000,
      });

      io.on("connection", (socket) => {
        logger.info(`Worker ${process.pid}: Connected to socket.io`);

        socket.on("setup", (userData) => {
          socket.join(userData._id);
          socket.emit("connected");
        });

        socket.on("join chat", (room) => {
          socket.join(room);
          logger.info(`Worker ${process.pid}: User joined room: ${room}`);
        });

        socket.on("typing", (room) => socket.in(room).emit("typing"));
        socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

        socket.on("new message", (newMessageRecieved) => {
          const chat = newMessageRecieved.chat;

          if (!chat?.users) return logger.info("chat.users not defined");

          chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
          });
        });

        socket.off("setup", () => {
          logger.info("USER DISCONNECTED");
          socket.leave(userData._id);
        });
      });
    })
    .catch((err) => {
      logger.error("MONGO db connection failed !!!", err);
    });
}
