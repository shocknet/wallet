import * as Actions from '../actions/myWall'
import Http from 'axios'
export const PinPost = (contentID: string) => async (dispatch: any) => {
  dispatch(Actions.beganSettingPinned(contentID))
  try {
    //TODO
    dispatch(Actions.finishedSettingPinned)
  } catch (e) {
    dispatch(Actions.ErrorSettingPinned(contentID, e))
  }
}

export const DeletePost = ({
  postId,
  page,
}: {
  postId: string
  page: string
}) => async (dispatch: any) => {
  const contentID = `${page}&${postId}`
  dispatch(Actions.beganDeletePost(contentID))
  try {
    const res = await Http.delete(`/api/gun/wall/${contentID}`)
    if (res.status !== 200) {
      throw new Error(`Status not OK`)
    }
    dispatch(Actions.finishedDeletePost(contentID))
  } catch (e) {
    dispatch(Actions.ErrorDeletePost(contentID, e))
  }
}
