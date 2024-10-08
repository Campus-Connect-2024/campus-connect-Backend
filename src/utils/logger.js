import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";

const { combine, timestamp, json, colorize, printf } = format;

// Ensure 'logs' directory exists
const logDir = path.join(path.resolve(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const getDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// Custom format for console logging with colors
const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create a Winston logger with file size-based rotation
const logger = createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    // Console transport with colorized output
    new transports.Console({
      format: combine(colorize(), consoleLogFormat),
    }),
    
    // File transport with file size limit (5 MB max size per file)
    new transports.File({
      filename: `${logDir}/app-${getDateString()}.log`,
      maxsize: 1 * 1024 * 1024,  // 5 MB
      maxFiles: 5,  // Keep 5 rotated log files
      format: combine(timestamp(), json()),
    }),
  ],
});

export default logger;
