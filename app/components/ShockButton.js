/**
 * @prettier
 */
import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { Icon } from 'react-native-elements'

import * as CSS from '../res/css'

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
const DEFAULT_ICON_COLOR = CSS.Colors.TEXT_WHITE
const DEFAULT_ICON_STYLE = { marginRight: 8 }

/**
 * @augments React.PureComponent<Props>
 */
export default class ShockButton extends React.PureComponent {
  static defaultProps = {
    title: '',
    color: CSS.Colors.ORANGE,
  }

  onPress = () => {
    const { disabled, onPress } = this.props

    onPress && !disabled && onPress()
  }

  render() {
    const { color, disabled, fullWidth, icon, title } = this.props

    /** @type {import('react-native').ViewProps['style']} */
    let containerStyle = xStyles.container

    if (disabled && fullWidth) {
      containerStyle = xStyles.containerDisabledFullWidth
    } else if (disabled) {
      containerStyle = xStyles.containerDisabled
    } else if (fullWidth) {
      containerStyle = xStyles.containerFullWidth
    }

    if (color) {
      containerStyle = [containerStyle, { backgroundColor: color }]
    }

    return (
      <TouchableHighlight
        onPress={this.onPress}
        style={containerStyle}
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
    )
  }
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
    backgroundColor: CSS.Colors.GRAY_MEDIUM,
  },

  text: {
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },

  row: {
    flexDirection: 'row',
  },
})

const xStyles = {
  container: styles.container,
  containerDisabled: [styles.container, styles.disabled],
  containerFullWidth: [styles.container, CSS.styles.width100],
  containerDisabledFullWidth: [
    styles.container,
    styles.disabled,
    CSS.styles.width100,
  ],
}
