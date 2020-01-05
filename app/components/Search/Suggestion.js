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
 * @prop {(import('react-native').ImageSourcePropType)=} avatar
 * @prop {('contact'|'btc')=} type
 * @prop {(import('react-native').RegisteredStyle<object>)=} style
 * @prop {((event: import('react-native').GestureResponderEvent) => void)=} onPress
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
}) => {
  const renderAvatar = () => {
    if (avatar) {
      return (
        <ImageBackground
          style={styles.suggestionAvatar}
          source={avatar}
          resizeMode="cover"
        />
      )
    }

    if (type === 'btc') {
      return (
        <View style={styles.suggestionAvatar}>
          <Ionicons
            name="logo-bitcoin"
            color="white"
            size={18}
            style={styles.suggestionIcon}
          />
        </View>
      )
    }

    return <View style={styles.suggestionAvatar} />
  }

  return (
    <TouchableOpacity style={[styles.inputSuggestion, style]} onPress={onPress}>
      {renderAvatar()}
      <Text
        style={styles.suggestionName}
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
  suggestionAvatar: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BUTTON_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  suggestionIcon: { opacity: 0.4 },
  suggestionName: {
    fontFamily: 'Montserrat-700',
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 12,
    width: '70%',
  },
})
