import React from 'react'
import { ToastAndroid, View } from 'react-native'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'

import * as Store from '../store'
import * as Services from '../services'

import PostHeader from './post-header'
import Post from './Post'
import Dialog from './ShockDialog'

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
  originalAuthorPublicKey: string
  originalAuthorDisplayName: string | null
  originalPostDate: number
}

interface DispatchProps {}

type Props = OwnProps & StateProps & DispatchProps

interface State {
  menuOpen: boolean
}

class SharedPost extends React.PureComponent<Props, State> {
  state: State = {
    menuOpen: false,
  }

  toggleMenu = () => {
    this.setState(({ menuOpen }) => ({
      menuOpen: !menuOpen,
    }))
  }

  menuChoicesIfOwn = {
    unshare: () => {
      const { postID } = this.props

      Services.post(`api/gun/put`, {
        path: `$user>sharedPosts>${postID}`,
        value: null,
      }).catch(e => {
        Logger.log(`Could not unshare post ${postID} -> ${e.message}`)
        ToastAndroid.show(`Could not unshare post`, ToastAndroid.LONG)
      })

      this.toggleMenu()
    },
  }

  render() {
    const {
      shareDate,
      sharedByDisplayName,
      sharedByPubkey,
      isOwn,
      postID,
      hideTopBorder,
    } = this.props

    return (
      <>
        <View>
          <PostHeader
            authorDisplayName={sharedByDisplayName}
            authorPublicKey={sharedByPubkey}
            timestamp={shareDate}
            onPressMenuIcon={isOwn ? this.toggleMenu : undefined}
            pad
            showTopBorder={!hideTopBorder}
          />

          <Post hideTopBorder id={postID} hideMenuBtn smallerHeader />
        </View>

        <Dialog
          onRequestClose={this.toggleMenu}
          visible={this.state.menuOpen}
          choiceToHandler={this.menuChoicesIfOwn}
        />
      </>
    )
  }
}

const mapState = (state: Store.State, ownProps: OwnProps): StateProps => {
  const {
    originalAuthor,
    originalPostID,
    shareDate,
    sharedBy,
  } = Store.selectSharedPost(state, ownProps.shareID)
  const myPubkey = Store.getMyPublicKey(state)
  const { displayName: sharedByDisplayName } = Store.selectUser(state, sharedBy)
  const { displayName: originalAuthorDisplayName } = Store.selectUser(
    state,
    sharedBy,
  )
  const post = Store.getPost(state, originalPostID)
  const isOwn = myPubkey === sharedBy

  if (!post) {
    return {
      isOwn,
      originalAuthorDisplayName: originalAuthorDisplayName || 'Loading...',
      originalAuthorPublicKey: originalAuthor,
      originalPostDate: Date.now(),
      postID: originalPostID,
      shareDate,
      sharedByDisplayName: sharedByDisplayName || 'Loading...',
      sharedByPubkey: sharedBy,
    }
  }

  return {
    isOwn,
    originalAuthorDisplayName: originalAuthorDisplayName || 'Loading...',
    originalAuthorPublicKey: originalAuthor,
    originalPostDate: post.date,
    postID: originalPostID,
    shareDate,
    sharedByDisplayName: sharedByDisplayName || 'Loading...',
    sharedByPubkey: sharedBy,
  }
}

const ConnectedSharedPost = connect(mapState)(SharedPost)

export default ConnectedSharedPost
