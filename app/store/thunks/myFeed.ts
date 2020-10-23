import Http from 'axios'
import * as Common from 'shock-common'
import * as R from 'ramda'
import * as Actions from '../actions/myFeed'

export const FetchPage = (
  page: number,
  currentPosts: Common.Schema.Post[],
) => async (dispatch: any) => {
  const pageToFetch = page + 1
  dispatch(Actions.beganFetchPage(pageToFetch))
  try {
    const res = await Http.get(`api/gun/feed?page=${pageToFetch}`)

    if (res.status !== 200) {
      throw new Error(`Not 200: ${JSON.stringify(res.data)}`)
    }

    const { posts: postsRecord } = res.data
    const isEmptyPage =
      Object.keys(postsRecord).length === 0 &&
      postsRecord.constructor === Object
    const fetchedPosts: Common.Schema.Post[] = Object.values(postsRecord)
    const mixedWithExisting = [...currentPosts, ...fetchedPosts]
    const dedupped = R.uniqBy(R.prop('id'), mixedWithExisting)
    const sorted = R.sort((a, b) => b.date - a.date, dedupped)
    dispatch(
      Actions.finishedFetchPage(isEmptyPage ? page : pageToFetch, sorted),
    )
  } catch (err) {
    dispatch(
      Actions.errorFetchPage(
        page,
        err.message || err.errorMessage || 'Unknown error',
      ),
    )
  }
}
