import React from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import Fontisto from 'react-native-vector-icons/Fontisto'
import Octicons from 'react-native-vector-icons/Octicons'

import * as CSS from '../../res/css'
import { ConnectedShockAvatar } from '../ShockAvatar'
import * as Store from '../../store'
import Pad from '../Pad'
import TimeText from '../time-text'

interface OwnProps {
  postID: string
  onPressMenuIcon?(): void
}

interface StateProps {
  authorDisplayName: string
  authorPublicKey: string
  date: number
  showPin: boolean
}

interface DispatchProps {}

type Props = OwnProps & StateProps & DispatchProps

const UserInfoNew: React.FC<Props> = ({
  authorDisplayName,
  authorPublicKey,
  date,
  onPressMenuIcon,
  showPin,
}) => (
  <View style={CSS.styles.rowCenteredSpaceBetween}>
    <View style={styles.userAndDate}>
      <ConnectedShockAvatar
        height={56}
        publicKey={authorPublicKey}
        onPress={F}
      />

      <Pad amount={10} insideRow />

      <View style={styles.nameAndDate}>
        <Text style={styles.name}>{authorDisplayName}</Text>
        <Pad amount={4} />
        <TimeText style={styles.date}>{date}</TimeText>
      </View>
    </View>

    <View style={CSS.styles.rowCentered}>
      {showPin && (
        <Octicons
          name="pin"
          size={24}
          color={CSS.Colors.DARK_MODE_BORDER_GRAY}
          style={!showPin && CSS.styles.displayNone}
        />
      )}
      <TouchableWithoutFeedback onPress={onPressMenuIcon}>
        <View style={styles.moreIconContainer}>
          <Fontisto
            name="more-v"
            size={24}
            color={CSS.Colors.DARK_MODE_BORDER_GRAY}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  </View>
)

const styles = StyleSheet.create({
  userAndDate: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  nameAndDate: {
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
  // TODO: do this with hitslop but I can't make it work.
  moreIconContainer: {
    // allow for easier press on icon
    paddingLeft: 24,
    paddingVertical: 12,
  },
})

const F = () => {}

const makeMapState = () => {
  const getUser = Store.makeGetUser()

  const mapState = (state: Store.State, ownProps: OwnProps): StateProps => {
    const post = Store.getPost(state, ownProps.postID)

    if (!post) {
      return {
        authorDisplayName: 'Error fetching this post',
        authorPublicKey: state.auth.gunPublicKey,
        date: Date.now(),
        showPin: false,
      }
    }

    const author = getUser(state, post.author)

    return {
      authorDisplayName: author.displayName || 'Loading',
      authorPublicKey: author.publicKey,
      date: post.date,
      showPin: author.pinnedPost === post.id,
    }
  }

  return mapState
}

const MemoizedUserInfoNew = React.memo(UserInfoNew)
const ConnectedUserInfoNew = connect(makeMapState)(MemoizedUserInfoNew)
export default ConnectedUserInfoNew
