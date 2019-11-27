import React from 'react'
import { View } from 'react-native'

/**
 * @typedef {object} Props
 * @prop {number} amount
 * @prop {boolean=} insideRow Pass if used inside a flexDirection=row component.
 */

/**
 * @type {React.FC<Props>}
 */
const _Pad = ({ amount, insideRow }) => ((
  <View
    style={
      insideRow
        ? {
            marginLeft: amount / 2,
            marginRight: amount / 2,
          }
        : {
            marginBottom: amount / 2,
            marginTop: amount / 2,
          }
    }
  ></View>
))

const Pad = React.memo(_Pad)

export default Pad
