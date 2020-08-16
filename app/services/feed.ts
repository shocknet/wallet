import Http, { AxiosResponse } from 'axios'
import { Store } from 'shock-common'
const { feedPage: commonFeedPage } = Store

export const getFeedPage = async (
  pageNumber: number,
): Promise<AxiosResponse> => {
  return await Http.get(`/api/gun/feed?page=${pageNumber}`)
}

export const feedPage: typeof commonFeedPage = async ({ before, page }) => {
  if (page) {
    const res = await Http.get(`api/gun/feed?page=${page}`)

    console.log('xcx')
    console.log(res.data)

    return res.data
  }

  if (before) {
    const res = await Http.get(`api/gun/feed?before=${before}`)

    return res.data
  }

  throw new ReferenceError('Must provide either page or before param')
}
