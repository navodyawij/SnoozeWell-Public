export class FitbitError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'FitbitError'
    this.code = code
    this.status = status
  }
}

export class FitbitErrorHandler {
  static MAX_RETRIES = 3
  static RETRY_DELAY = 1000 // 1 second

  static async handleError(error, retryCount = 0) {
    if (error instanceof FitbitError) {
      switch (error.code) {
        case 'expired_token':
          // Token expired, should be handled by TokenManager
          throw error
        case 'invalid_token':
          // Token is invalid, user needs to reconnect
          throw new FitbitError('Please reconnect your Fitbit account', 'reconnect_required', 401)
        case 'rate_limit':
          if (retryCount < this.MAX_RETRIES) {
            await this.delay(this.RETRY_DELAY * Math.pow(2, retryCount))
            return this.handleError(error, retryCount + 1)
          }
          throw new FitbitError('Rate limit exceeded. Please try again later.', 'rate_limit', 429)
        default:
          throw error
      }
    }

    // Handle network errors
    if (!navigator.onLine) {
      throw new FitbitError('No internet connection', 'network_error', 0)
    }

    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new FitbitError('Request timed out', 'timeout', 408)
    }

    // Handle unknown errors
    throw new FitbitError('An unexpected error occurred', 'unknown_error', 500)
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static parseApiError(response) {
    switch (response.status) {
      case 400:
        return new FitbitError('Invalid request', 'invalid_request', 400)
      case 401:
        return new FitbitError('Unauthorized', 'unauthorized', 401)
      case 403:
        return new FitbitError('Forbidden', 'forbidden', 403)
      case 404:
        return new FitbitError('Resource not found', 'not_found', 404)
      case 429:
        return new FitbitError('Rate limit exceeded', 'rate_limit', 429)
      case 500:
        return new FitbitError('Internal server error', 'server_error', 500)
      default:
        return new FitbitError('Unknown error', 'unknown_error', response.status)
    }
  }
} 