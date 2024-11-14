const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
}

class Logger {
  constructor() {
    this.logs = []
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }

    this.logs.push(logEntry)
    
    // Console output
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(message, data)
        break
      case LOG_LEVELS.WARN:
        console.warn(message, data)
        break
      case LOG_LEVELS.INFO:
        console.info(message, data)
        break
      case LOG_LEVELS.DEBUG:
        console.debug(message, data)
        break
    }

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }

  error(message, data) {
    this.log(LOG_LEVELS.ERROR, message, data)
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data)
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data)
  }

  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, message, data)
  }

  getLogs() {
    return this.logs
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger() 