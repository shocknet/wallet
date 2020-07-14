import Http, { AxiosResponse } from 'axios'

export const getFeedPage = async (
  pageNumber: number,
): Promise<AxiosResponse> => {
  console.log(pageNumber)
  return await Http.get(`/api/gun/feed?page=${pageNumber}`)
}
