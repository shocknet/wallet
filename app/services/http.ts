import Http, { AxiosResponse } from 'axios'

interface ErrorResponse {
  message?: string
  errorMessage?: string
}

const isErrResponse = (u: unknown): u is ErrorResponse => {
  if (typeof u !== 'object') {
    return false
  }

  if (u === null) {
    return false
  }

  const res = u as ErrorResponse

  if (typeof res.message === 'string' && Object.keys(res).length === 1) {
    return true
  }

  if (typeof res.errorMessage === 'string') {
    return true
  }

  return false
}

/**
 * @param url
 * @param data
 * @param validator
 * @throws {Error}
 * @throws {TypeError}
 */
export const post = async <T>(
  url: string,
  /**
   * This would be typed as `Record<string, unknown>` except for
   * https://github.com/microsoft/TypeScript/issues/15300. It's easier to have
   * this "badly" typed than to correct dozens of typings elsewhere.
   */
  data?: Record<string, any>,
  validator?: (data: unknown) => string,
): Promise<T> => {
  try {
    const axiosRes: AxiosResponse<T | ErrorResponse> = await Http.post(
      url,
      data,
    )

    const { data: dataReceived, status } = axiosRes

    if (isErrResponse(dataReceived)) {
      throw new Error(
        dataReceived.errorMessage ||
          dataReceived.message ||
          'Unknown Error (Not a valid error response)',
      )
    }

    if (status !== 200) {
      throw new Error(`Non OK response, no error message.`)
    }

    if (validator) {
      const msg = validator(dataReceived)

      if (msg) {
        throw new TypeError(msg)
      }
    }

    return dataReceived
  } catch (err) {
    if (typeof err.message === 'string') {
      throw err
    }

    if (err.response && err.response.data) {
      if (typeof err.response.data === 'object') {
        const { message, errorMessage } = err.response.data
        if (errorMessage) {
          throw new Error(errorMessage)
        }

        if (message) {
          throw new Error(message)
        }
      }

      if (typeof err.response.data === 'string') {
        throw new Error(err.response.data)
      }
    }

    throw new Error(`Unknown Error (Malformed): ${JSON.stringify(err)}`)
  }
}

/**
 * @param url
 * @param headers
 * @param validator
 * @throws {Error}
 * @throws {TypeError}
 */
export const get = async <T>(
  url: string,
  headers?: Record<string, string>,
  validator?: (data: unknown) => string,
): Promise<T> => {
  try {
    const axiosRes: AxiosResponse<T | ErrorResponse> = await Http.get(url, {
      headers,
    })

    const { data: dataReceived, status } = axiosRes

    if (isErrResponse(dataReceived)) {
      throw new Error(
        dataReceived.errorMessage ||
          dataReceived.message ||
          'Unknown Error (Not a valid error response)',
      )
    }

    if (status !== 200) {
      throw new Error(`Non OK response, no error message.`)
    }

    if (validator) {
      const msg = validator(dataReceived)

      if (msg) {
        throw new TypeError(msg)
      }
    }

    return dataReceived
  } catch (err) {
    if (typeof err.message === 'string') {
      throw err
    }

    if (err.response && err.response.data) {
      if (typeof err.response.data === 'object') {
        const { message, errorMessage } = err.response.data
        if (errorMessage) {
          throw new Error(errorMessage)
        }

        if (message) {
          throw new Error(message)
        }
      }

      if (typeof err.response.data === 'string') {
        throw new Error(err.response.data)
      }
    }

    throw new Error(`Unknown Error (Malformed): ${JSON.stringify(err)}`)
  }
}
