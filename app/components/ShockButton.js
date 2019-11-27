/**
 * @prettier
 */
import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { Icon } from 'react-native-elements'

import { Colors } from '../css'

/**
 * @typedef {object} IconProps
 * @prop {string} name
 * @prop {string=} color
 * @prop {number=} size
 * @prop {string} type
 * @prop {(import('react-native-elements').IconProps['iconStyle'])=} iconStyle
 */

/**
 * @typedef {object} Props
 * @prop {string=} color
 * @prop {boolean=} disabled
 * @prop {boolean=} fullWidth
 * @prop {IconProps=} icon
 * @prop {(() => void)=} onPress
 * @prop {string} title
 */

const DEFAULT_ICON_SIZE = 17
const DEFAULT_ICON_COLOR = Colors.TEXT_WHITE
const DEFAULT_ICON_STYLE = { marginRight: 8 }

/**
 * @type {React.FC<Props>}
 */
const ShockButton = ({ color, disabled, fullWidth, icon, onPress, title }) => {
  /**
   * @type {import('react-native').TouchableHighlightProps['style']}
   */
  const rootStyles = [styles.container]

  if (fullWidth) {
    rootStyles.push(styles.fullWidth)
  }

  if (color) {
    rootStyles.push({
      backgroundColor: color,
    })
  }

  return ((
    <TouchableHighlight
      onPress={
        disabled
          ? undefined
          : () => {
              onPress && onPress()
            }
      }
      style={[rootStyles, disabled && styles.disabled]}
      underlayColor={color}
    >
      <View style={styles.row}>
        <View>
          {icon && (
            <Icon
              name={icon.name}
              type={icon.type}
              size={icon.size ? icon.size : DEFAULT_ICON_SIZE}
              color={icon.color ? icon.color : DEFAULT_ICON_COLOR}
              iconStyle={icon.iconStyle ? icon.iconStyle : DEFAULT_ICON_STYLE}
            />
          )}
        </View>
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableHighlight>
  ))
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 0,
    justifyContent: 'center',
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 16,
  },

  disabled: {
    backgroundColor: Colors.GRAY_MEDIUM,
  },

  text: {
    color: Colors.TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },

  fullWidth: {
    width: '100%',
  },

  row: {
    flexDirection: 'row',
  },
})

ShockButton.defaultProps = {
  title: '',
  color: Colors.ORANGE,
}

export default React.memo(ShockButton)
