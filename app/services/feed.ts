import Http, { AxiosResponse } from 'axios'

export const getFeedPage = async (
  pageNumber: number,
): Promise<AxiosResponse> => {
  return await Http.get(`/api/gun/feed?page=${pageNumber}`)
}
