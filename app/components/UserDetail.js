/**
 * @prettier
 */
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import * as CSS from '../res/css'

import { ConnectedShockAvatar } from './ShockAvatar'

/**
 * @typedef {object} Props
 * @prop {string=} alternateText
 * @prop {boolean=} alternateTextBold
 * @prop {React.ReactNode} lowerText
 * @prop {import('react-native').TextInputProps['style']=} lowerTextStyle
 * @prop {string} id
 * @prop {string} name
 * @prop {boolean=} nameBold
 * @prop {((id: string) => void)=} onPress
 * @prop {string=} title
 * @prop {number|null} lastSeenApp
 * @prop {string} publicKey
 **/

/**
 * @augments React.PureComponent<Props>
 */
export default class UserDetail extends React.PureComponent {
  onPress = () => {
    const { id, onPress } = this.props

    onPress && onPress(id)
  }

  /** @type {number|null} */
  intervalID = 0

  render() {
    const {
      alternateText,
      alternateTextBold,
      nameBold,
      lowerText,
      lowerTextStyle,
      name,
      title,
    } = this.props

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={styles.container}>
          <View style={xStyles.avatarSubContainer}>
            <ConnectedShockAvatar
              height={50}
              publicKey={this.props.publicKey}
            />
          </View>

          <View style={xStyles.nameContainer}>
            {title && <Text style={styles.title}>{title}</Text>}

            <Text
              numberOfLines={1}
              style={nameBold ? styles.nameBold : styles.name}
            >
              {name}
              <Text
                style={
                  alternateTextBold
                    ? styles.alternateTextBold
                    : styles.alternateText
                }
              >
                {alternateText && ` ${alternateText}`}
              </Text>
            </Text>

            {typeof lowerText === 'string' ? (
              <Text numberOfLines={2} style={lowerTextStyle && lowerTextStyle}>
                {lowerText}
              </Text>
            ) : (
              lowerText
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const nameTextStyle = {
  color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
  fontSize: 16,
  fontFamily: 'Montserrat-700',
}

/**
 * @type {import('react-native').ViewStyle}
 */
const alternateTextStyle = {
  // @ts-expect-error TODO
  color: CSS.Colors.TEXT_LIGHT,
  fontSize: 14,
  fontWeight: '200',
}

const styles = StyleSheet.create({
  alternateText: {
    ...alternateTextStyle,
  },

  alternateTextBold: {
    ...alternateTextStyle,
    fontWeight: 'bold',
  },

  avatarContainer: {
    justifyContent: 'center',
  },

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {
    ...nameTextStyle,
  },

  nameBold: {
    ...nameTextStyle,
    fontWeight: 'bold',
  },

  subContainer: {
    paddingLeft: 4,
    paddingRight: 4,
  },

  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },

  title: {
    color: CSS.Colors.TEXT_LIGHT,
    fontWeight: '500',
  },
})

const xStyles = {
  avatarSubContainer: [styles.avatarContainer, styles.subContainer],
  nameContainer: [styles.subContainer, styles.textContainer],
}
