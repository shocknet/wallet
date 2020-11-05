import React from 'react'
import { Text, TextProps } from 'react-native'
import Moment from 'moment'

const TimeText: React.FC<TextProps & { children: number }> = React.memo(
  ({ children: timestamp, ...props }) => {
    return <Text {...props}>{Moment(timestamp).fromNow()}</Text>
  },
)

export default TimeText
