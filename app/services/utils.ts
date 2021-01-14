import Logger from 'react-native-file-log'
import { memo, MemoExoticComponent, FunctionComponent } from 'react'

// Record<string, string|number|boolean> could have been used for params but
// typescript complains on param bodies with optional parameters.
/**
 * @param url
 * @param params
 */
export const getQueryParams = (
  url: string,
  params: Record<string, any> = {},
): string => {
  let finalURL = url

  Object.entries(params).forEach(([param, value], i) => {
    if (i === 0) {
      finalURL += '?'
    } else {
      finalURL += '&'
    }

    if (typeof value === 'boolean') {
      if (true === value) {
        finalURL += param
      }
    } else if (typeof value === 'string') {
      if (value.length === 0) {
        throw new TypeError(
          'Expected an string query parameter value to have a length',
        )
      }

      finalURL += `${param}=${value}`
    } else if (typeof value === 'number') {
      finalURL += `${param}=${value.toString()}`
    } else {
      throw new TypeError('Unknown type for query paramater')
    }
  })

  return finalURL
}

/**
 * @param pub
 */
export const defaultName = (pub: string): string => 'anon' + pub.slice(0, 8)

export const SET_LAST_SEEN_APP_INTERVAL = 15000

/**
 * @param lastSeen
 */
export const isOnline = (lastSeen: number): boolean =>
  Date.now() - lastSeen < SET_LAST_SEEN_APP_INTERVAL * 2

/**
 * Converts seconds/microseconds timestamps to milliseconds, leaves milliseconds
 * timestamps untouched. Works for timestamps no older than 2001.
 * @timestamp A timestamp that can be seconds, milliseconds or microseconds.
 * Should be no older than 2001.
 */
export function normalizeTimestampToMs(timestamp: number): number {
  if (timestamp === 0) {
    return timestamp
  }

  const t = timestamp.toString()

  if (t.length === 10) {
    // is seconds
    return Number(t) * 1000
  } else if (t.length === 13) {
    // is milliseconds
    return Number(t)
  } else if (t.length === 16) {
    // is microseconds
    return Number(t) / 1000
  }

  Logger.log('normalizeTimestamp() -> could not interpret timestamp')

  return Number(t)
}

export const betterReactMemo = <P = Record<string, unknown>>(
  component: FunctionComponent<P>,
): MemoExoticComponent<FunctionComponent<P>> => {
  const MemoizedComponent = memo(component)

  if (component.displayName) {
    MemoizedComponent.displayName = 'Memoized' + component.displayName
  }

  // @ts-expect-error Not supported according to the typings but needed in some
  // cases.
  MemoizedComponent.propTypes = component.propTypes

  return MemoizedComponent
}
