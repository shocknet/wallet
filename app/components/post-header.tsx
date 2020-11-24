import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native'

import Fontisto from 'react-native-vector-icons/Fontisto'
import Octicons from 'react-native-vector-icons/Octicons'

import * as CSS from '../res/css'

import Pad from './Pad'
import TimeText from './time-text'
import { ConnectedShockAvatar } from './ShockAvatar'

interface PostHeaderProps {
  authorDisplayName: string | null
  /**
   * Needed for connected avatar.
   */
  authorPublicKey: string
  timestamp: number
  showPin?: boolean
  smaller?: boolean
  onPressMenuIcon?(): void
  pad?: boolean
  showTopBorder?: boolean
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  authorDisplayName,
  authorPublicKey,
  onPressMenuIcon,
  showPin,
  smaller,
  timestamp,
  showTopBorder,
  pad,
}) => {
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_BLUEISH_GRAY,
  }

  if (showTopBorder) {
    containerStyle.borderTopColor = CSS.Colors.DARK_MODE_BORDER_GRAY
    containerStyle.borderTopWidth = 1
  }

  if (pad) {
    containerStyle.paddingHorizontal = 24
    containerStyle.paddingTop = 24
  }

  return (
    <View style={containerStyle}>
      <View style={styles.userAndDate}>
        <ConnectedShockAvatar
          height={smaller ? 32 : 56}
          publicKey={authorPublicKey}
        />

        <Pad amount={10} insideRow />

        <View style={styles.nameAndDate}>
          <Text style={smaller ? styles.nameSmaller : styles.name}>
            {authorDisplayName}
          </Text>
          <Pad amount={4} />
          <TimeText style={smaller ? styles.dateSmaller : styles.date}>
            {timestamp}
          </TimeText>
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
        <View style={onPressMenuIcon ? undefined : CSS.styles.displayNone}>
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
    </View>
  )
}

const nameBase = {
  color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
  fontFamily: 'Montserrat-Bold',
  fontSize: 18,
  letterSpacing: 0,
}

const dateBase = {
  color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
  fontFamily: 'Montserrat-Regular',
  fontSize: 12,
}

const styles = StyleSheet.create({
  userAndDate: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  nameAndDate: {
    justifyContent: 'space-around',
  },
  name: nameBase,
  nameSmaller: {
    ...nameBase,
    fontSize: 14,
  },
  date: dateBase,
  dateSmaller: {
    ...dateBase,
    fontSize: 8,
  },
  // TODO: do this with hitslop but I can't make it work.
  moreIconContainer: {
    // allow for easier press on icon
    paddingLeft: 24,
    paddingVertical: 12,
  },
})

const MemoizedPostHeader = React.memo(PostHeader)

export default MemoizedPostHeader
