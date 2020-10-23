import React from 'react'
import {
  View,
  ImageBackground,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../../res/css'

/**
 * @typedef {object} Props
 * @prop {string} name
 * @prop {(import('react-native').ImageSourcePropType|string)=} avatar
 * @prop {('contact'|'btc'|'invoice'|'keysend')=} type
 * @prop {(import('react-native').RegisteredStyle<object>|object)=} style
 * @prop {((event: import('react-native').GestureResponderEvent) => void)=} onPress
 * @prop {(string)=} theme
 */

/**
 * @param {Props} props
 */
const Suggestion = ({
  name = '',
  avatar,
  style,
  onPress,
  type = 'contact',
  theme = 'dark',
}) => {
  const renderAvatar = () => {
    if (avatar) {
      return (
        <ImageBackground
          style={
            theme === 'dark'
              ? styles.suggestionAvatarDark
              : styles.suggestionAvatar
          }
          //@ts-expect-error
          source={avatar}
          resizeMode="cover"
        />
      )
    }

    if (type === 'btc') {
      return (
        <View
          style={
            theme === 'dark'
              ? styles.suggestionAvatarDark
              : styles.suggestionAvatar
          }
        >
          <Ionicons
            name="logo-bitcoin"
            color="white"
            size={18}
            style={
              theme === 'dark'
                ? styles.suggestionIconDark
                : styles.suggestionIcon
            }
          />
        </View>
      )
    }

    if (type === 'invoice') {
      return (
        <View
          style={
            theme === 'dark'
              ? styles.suggestionAvatarDark
              : styles.suggestionIcon
          }
        >
          <Ionicons
            name="md-list-box"
            color="white"
            size={18}
            style={
              theme === 'dark'
                ? styles.suggestionIconDark
                : styles.suggestionIcon
            }
          />
        </View>
      )
    }
    if (type === 'keysend') {
      return (
        <View
          style={
            theme === 'dark'
              ? styles.suggestionAvatarDark
              : styles.suggestionAvatar
          }
        >
          <Ionicons
            name="md-list-box"
            color="white"
            size={18}
            style={
              theme === 'dark'
                ? styles.suggestionIconDark
                : styles.suggestionIcon
            }
          />
        </View>
      )
    }

    return (
      <View
        style={
          theme === 'dark'
            ? styles.suggestionAvatarDark
            : styles.suggestionAvatar
        }
      />
    )
  }

  return (
    <TouchableOpacity
      style={[
        theme === 'dark' ? styles.inputSuggestionDark : styles.inputSuggestion,
        style,
      ]}
      onPress={onPress}
    >
      {renderAvatar()}
      <Text
        style={
          theme === 'dark' ? styles.suggestionNameDark : styles.suggestionName
        }
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {name}
      </Text>
    </TouchableOpacity>
  )
}

export default Suggestion

const styles = StyleSheet.create({
  inputSuggestion: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputSuggestionDark: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionAvatar: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  suggestionAvatarDark: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  suggestionIcon: { opacity: 0.4 },
  suggestionIconDark: { opacity: 0.4 },
  suggestionName: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 12,
    width: '70%',
  },
  suggestionNameDark: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 12,
    width: '70%',
  },
})
