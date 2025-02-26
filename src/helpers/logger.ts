import chalk from "chalk"
import fs from "fs"
import path from "path"
import winston from "winston"

import { SRC_DIR } from "@/features/config"

const logDir = path.join(SRC_DIR, "logs")

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} | ${level.toUpperCase()}: ${message}`
})

class Logger {
  logger: winston.Logger

  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(winston.format.timestamp({ format: "DD-MM-YY HH:mm" }), logFormat),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(SRC_DIR, "logs", "app.log"),
          maxsize: 5 * 1024 * 1024,
          maxFiles: 3,
          tailable: true,
        }),
      ],
    })
  }

  async success(text: string) {
    this.logger.info(chalk.green(text))

  }

  async error(text: string) {
    this.logger.error(chalk.red(text))

  }

  async info(text: string) {
    this.logger.info(chalk.gray(text))

  }
}

const logger = new Logger()

export { logger }
