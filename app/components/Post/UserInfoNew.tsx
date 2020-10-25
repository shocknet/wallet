import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import * as CSS from '../../res/css'
import { ConnectedShockAvatar } from '../ShockAvatar'
import * as Store from '../../store'
import Pad from '../Pad'
import TimeText from '../time-text'

interface OwnProps {
  postID: string
}

interface StateProps {
  authorDisplayName: string
  authorPublicKey: string
  date: number
}

interface DispatchProps {}

type Props = OwnProps & StateProps & DispatchProps

const UserInfoNew: React.FC<Props> = ({
  authorDisplayName,
  authorPublicKey,
  date,
}) => (
  <View style={style.container}>
    <ConnectedShockAvatar height={56} publicKey={authorPublicKey} onPress={F} />

    <Pad amount={10} insideRow />

    <View style={style.sub}>
      <Text style={style.name}>{authorDisplayName}</Text>
      <Pad amount={4} />
      <TimeText style={style.date}>{date}</TimeText>
    </View>
  </View>
)

const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  sub: {
    width: '100%',
    justifyContent: 'space-around',
  },
  name: {
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    letterSpacing: 0,
  },
  date: {
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
  },
})

const makeMapState = () => {
  const getUser = Store.makeGetUser()

  const mapState = (state: Store.State, ownProps: OwnProps): StateProps => {
    const post = Store.getPost(state, ownProps.postID)

    if (!post) {
      return {
        authorDisplayName: 'Error fetching this post',
        authorPublicKey: state.auth.gunPublicKey,
        date: Date.now(),
      }
    }

    const author = getUser(state, post.author)

    return {
      authorDisplayName: author.displayName || 'Loading',
      authorPublicKey: author.publicKey,
      date: post.date,
    }
  }

  return mapState
}

const F = () => {}

const MemoizedUserInfoNew = React.memo(UserInfoNew)
const ConnectedUserInfoNew = connect(makeMapState)(MemoizedUserInfoNew)
export default ConnectedUserInfoNew
