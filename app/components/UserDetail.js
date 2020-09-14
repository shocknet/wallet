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
 * @augments React.Component<Props>
 */
export default class UserDetail extends React.Component {
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

    const theme = 'dark'

    if (theme === 'dark') {
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
              {title && (
                <Text
                  style={theme === 'dark' ? styles.titleDark : styles.title}
                >
                  {title}
                </Text>
              )}

              <View style={styles.nameAndTimeStampBar}>
                <Text style={nameBold ? styles.nameBoldDark : styles.nameDark}>
                  {name}
                </Text>

                <Text
                  style={
                    alternateTextBold
                      ? styles.alternateTextBoldDark
                      : styles.alternateTextDark
                  }
                >
                  {alternateText && ` ${alternateText}`}
                </Text>
              </View>

              {typeof lowerText === 'string' ? (
                <Text
                  numberOfLines={2}
                  style={lowerTextStyle && lowerTextStyle}
                >
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
  color: CSS.Colors.TEXT_STANDARD,
  fontSize: 16,
}

/**
 * @type {import('react-native').ViewStyle}
 */
const alternateTextStyle = {
  // @ts-ignore TODO
  color: CSS.Colors.TEXT_LIGHT,
  fontSize: 14,
  fontWeight: '200',
}

const styles = StyleSheet.create({
  alternateText: {
    ...alternateTextStyle,
    color: '#EBEBEB',
    flex: 1,
    textAlign: 'right',
  },

  alternateTextBold: {
    ...alternateTextStyle,
    fontWeight: 'bold',
    color: '#EBEBEB',
    flex: 1,
    textAlign: 'right',
  },

  alternateTextDark: {
    ...alternateTextStyle,
    color: '#EBEBEB',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Montserrat-600',
    fontSize: 9,
  },

  alternateTextBoldDark: {
    ...alternateTextStyle,
    color: '#EBEBEB',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Montserrat-600',
    fontSize: 9,
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
    color: '#EBEBEB',
    flex: 1,
  },

  nameDark: {
    ...nameTextStyle,
    color: '#EBEBEB',
    flex: 1,
    fontFamily: 'Montserrat-600',
    fontSize: 14,
  },

  nameBold: {
    ...nameTextStyle,
    color: '#EBEBEB',
    fontWeight: 'bold',
    flex: 1,
  },

  nameBoldDark: {
    ...nameTextStyle,
    color: '#EBEBEB',
    flex: 1,
    fontFamily: 'Montserrat-600',
    fontSize: 14,
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

  titleDark: {
    color: '#EBEBEB',
    fontFamily: 'Montserrat-600',
    fontSize: 14,
  },

  nameAndTimeStampBar: { flexDirection: 'row', flex: 1 },
})

const xStyles = {
  avatarSubContainer: [styles.avatarContainer, styles.subContainer],
  nameContainer: [styles.subContainer, styles.textContainer],
}
