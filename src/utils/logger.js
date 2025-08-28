import pino from "pino";
const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    base: null,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination(`public/log/app.log`)
);
export default logger;
