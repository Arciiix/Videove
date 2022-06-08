import winston from "winston";

let customFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(
    (info) => `[${info.level}] ${info.timestamp}: ${info.message}`
  )
);

export default winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.Console({
      format: customFormat,
    }),
  ],
});
