const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;
const path = require('path');
const fs = require('fs')

// checvkinge logs directory 
const logsDirectory = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
}

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}] - ${message}`;
});

// Create a logger instance
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.splat(),
        logFormat
    ),
    transports: [
        // new transports.File({ filename: path.join(logsDirectory, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logsDirectory, 'combined.log') })
    ]
});

const saveLoggers = (req, message) => {
    logger.info(`${req.method} ${req.url} - Request Body: ${JSON.stringify(req.body)}`);
    logger.error(`Error occurred: ${message}`);
}

module.exports = { saveLoggers };