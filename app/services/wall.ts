import * as Common from 'shock-common'
import Http from 'axios'
import Logger from 'react-native-file-log'

/**
 * @param title
 * @param contentItems
 * @param tags
 * @throws {Error}
 * @throws {TypeError}
 */
export const createPost = async (
  title: string,
  contentItems: Common.SchemaTypes.Post,
  tags: string[] = [],
): Promise<Common.SchemaTypes.Post & { id: string }> => {
  try {
    const res = await Http.post(`/api/gun/wall/`, {
      title,
      contentItems,
      tags,
    })

    if (res.status !== 201) {
      throw new Error(res.data.errorMessage)
    }

    if (!Common.Schema.isPost(res.data)) {
      throw new TypeError(
        `Unexpected response from server, expected a Post instead got: ${res.data}`,
      )
    }

    return res.data as Common.SchemaTypes.Post & { id: string }
  } catch (err) {
    console.warn(err)
    Logger.log(
      `services/wall/createPost() -> ${err.message || 'Unknown Error'}`,
    )
    throw err
  }
}

/**
 * @param postID
 * @throws {Error}
 */
export const deletePost = async (postID: string): Promise<void> => {
  try {
    const res = await Http.delete(`/api/gun/wall/${postID}`)

    if (res.status !== 204) {
      throw new Error(res.data.errorMessage)
    }
  } catch (err) {
    console.warn(err)
    Logger.log(
      `services/wall/deletePost() -> ${err.message || 'Unknown Error'}`,
    )
    throw err
  }
}

/**
 * Pass a positive number for accesing pages as they are stored in gun. Pass a
 * negative number for accesing pages in reverse order (newest to oldest).
 * @param page
 * @throws {TypeError}
 */
export const getPage = async (
  page: number,
): Promise<Common.SchemaTypes.WallPage & { numOfPages: number }> => {
  try {
    const res = await Http.get(`/api/gun/wall?page=${page}`)

    if (res.status !== 200) {
      throw new Error(res.data.errorMessage)
    }

    if (!Common.Schema.isWallPage(res.data)) {
      throw new TypeError(
        `Data received is not wall page, instead got: ${res.data}`,
      )
    }

    return res.data as Common.SchemaTypes.WallPage & { numOfPages: number }
  } catch (err) {
    console.warn(err)
    Logger.log(`services/wall/getPage() -> ${err.message || 'Unknown Error'}`)
    throw err
  }
}
