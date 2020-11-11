import React from 'react'
import { Text, TextProps } from 'react-native'
import Moment from 'moment'

import * as Services from '../services'

interface Props extends TextProps {
  children: number
  displayHHMM?: boolean
}

export default class TimeText extends React.PureComponent<Props> {
  intervalID: null | ReturnType<typeof setInterval> = null

  componentDidMount() {
    this.intervalID = setInterval(() => {
      this.forceUpdate()
    }, 60000)
  }

  componentWillUnmount() {
    if (this.intervalID) {
      clearInterval(this.intervalID)
      this.intervalID = null
    }
  }

  render() {
    const { children: timestamp, displayHHMM, ...props } = this.props

    const msTimestamp = Services.normalizeTimestampToMs(timestamp)

    return (
      <Text {...props}>
        {displayHHMM
          ? Moment(msTimestamp).format('hh:mm')
          : Moment(msTimestamp).fromNow()}
      </Text>
    )
  }
}
