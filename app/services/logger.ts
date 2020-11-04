// @ts-expect-error
import Logger from 'node_modules/react-native-file-log/index'

import { log, getStore } from '../store'

// Avoid excessive dispatchs if debug mode has not been enabled.
let enabled = false
const store = getStore()
let unsub = () => {}
unsub = store.subscribe(() => {
  const state = store.getState()

  if (state.debug.enabled) {
    enabled = true
    unsub()
  }
})

const logger = {
  /**
   * Equivalent functionality as console.log but saves the specified params to a file if enabled.
   */
  log(...content: any[]): void {
    if (enabled) {
      getStore().dispatch(log(...content))
    }
    Logger.log(...content)
  },
  /**
   * Sets a tag for logs and specifies a folder name as well for the logs location, default is RNReactLogging
   */
  setTag(tag: string): void {
    Logger.setTag(tag)
  },
  /**
   * Enables calling console.log when invoking the log function, enabled by default
   */
  setConsoleLogEnabled(enabled: boolean): void {
    Logger.setConsoleLogEnabled(enabled)
  },
  /**
   * Enables saving logs to a file, disabled by default
   */
  setFileLogEnabled(enabled: boolean): void {
    Logger.setFileLogEnabled(enabled)
  },
  /**
   * Sets the maximum file size limit before creating a new one. default is 512KB
   */
  setMaxFileSize(size: number): void {
    Logger.setMaxFileSize(size)
  },
  /**
   * Returns an array with the paths for all log files saved.
   */
  listAllLogFiles(): Promise<string[]> {
    return Logger.listAllLogFiles()
  },
}

export default logger
