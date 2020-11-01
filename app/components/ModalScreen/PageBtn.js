import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import * as CSS from '../../res/css'

/**
 * @typedef {object} Props
 * @prop {number} page
 * @prop {boolean} isSelected
 * @prop {(page: number) => void} onPress
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class PageBtn extends React.PureComponent {
  onPress = () => {
    this.props.onPress(this.props.page)
  }

  render() {
    const { isSelected } = this.props
    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={isSelected ? styles.btnSelected : styles.btn} />
      </TouchableOpacity>
    )
  }
}

const SIZE = 22
const MARGIN = 8

const baseBtn = {
  backgroundColor: '#D0C1C1',
  borderRadius: SIZE / 2,
  height: SIZE,
  width: SIZE,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 12,
  },
  shadowOpacity: 0.58,
  shadowRadius: 16.0,

  elevation: 5,

  marginLeft: MARGIN,
  marginRight: MARGIN,
}

const styles = StyleSheet.create({
  btn: baseBtn,
  btnSelected: {
    ...baseBtn,
    backgroundColor: CSS.Colors.BACKGROUND_BLUE,
  },
})
