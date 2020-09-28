import Http, { AxiosResponse } from 'axios'
import {} from 'shock-common'

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
  data?: Record<string, unknown>,
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

    throw new Error(`Unknown Error (Malformed)`)
  }
}
