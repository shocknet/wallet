import React from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'

import * as Store from '../store'

import { UserInfoNew as PostHeader } from './UserInfoNew'
import Post from './Post'

interface OwnProps {
  shareID: string
  hideTopBorder?: boolean
}

interface StateProps {
  shareDate: number
  sharedByDisplayName: string
  sharedByPubkey: string
  isOwn: boolean
  postID: string
}

interface DispatchProps {}

type Props = OwnProps & StateProps & DispatchProps

class SharedPost extends React.PureComponent<Props> {
  onPressMenuIcon = () => {
    console.warn(Math.random())
  }

  render() {
    const {
      shareDate,
      shareID,
      sharedByDisplayName,
      sharedByPubkey,
      isOwn,
      postID,
    } = this.props

    return (
      <View>
        <PostHeader
          authorDisplayName={sharedByDisplayName}
          authorPublicKey={sharedByPubkey}
          date={shareDate}
          postID={shareID}
          showPin={false}
          onPressMenuIcon={isOwn ? this.onPressMenuIcon : undefined}
        />

        <Post
          hideTopBorder
          id={postID}
          showTipBtn={!isOwn}
          hideShareBtn={isOwn}
        />
      </View>
    )
  }
}

const mapState = (state: Store.State, ownProps: OwnProps): StateProps => {
  const { originalPostID, sharedBy, shareDate } = Store.selectSharedPost(
    state,
    ownProps.shareID,
  )
  const sharer = Store.selectUser(state, sharedBy)
  const myPubkey = Store.getMyPublicKey(state)

  return {
    isOwn: myPubkey === sharedBy,
    shareDate,
    sharedByDisplayName: sharer.displayName || 'Shock User',
    postID: originalPostID,
    sharedByPubkey: sharedBy,
  }
}

const ConnectedSharedPost = connect(mapState)(SharedPost)

export default ConnectedSharedPost
