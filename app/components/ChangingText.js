import React from 'react'
import { Text } from 'react-native'
import size from 'lodash/size'

/**
 * @typedef {import('react-native').TextProps & {poll?: number, cycle?: boolean}} Props
 * @typedef {{ i: number }} State
 */

/**
 * We must not assume <Text /> is pure so we use React.PureComponent.
 * @augments React.PureComponent<Props,State>
 */
export default class ChangingText extends React.PureComponent {
  state = {
    i: 0,
  }

  intervalID = -1

  componentDidMount() {
    if (Array.isArray(this.props.children) && this.props.poll) {
      this.intervalID = setInterval(this.onTick, this.props.poll)
    }
  }

  onTick = () => {
    this.setState(
      (
        { i },
        // @ts-expect-error
        { children, cycle },
      ) => {
        const len = size(children)

        let newIdx = i

        const atLastItem = i === len - 1

        if (atLastItem && cycle) {
          newIdx = 0
        }

        if (!atLastItem) {
          newIdx = i + 1
        }

        return {
          i: newIdx,
        }
      },
      () => {
        // @ts-expect-error
        const len = size(this.props.children)
        if (
          this.state.i === len - 1 &&
          this.intervalID !== -1 &&
          !this.props.cycle
        ) {
          clearInterval(this.intervalID)
          this.intervalID = -1
        }
      },
    )
  }

  componentWillUnmount() {
    if (this.intervalID !== -1) {
      clearInterval(this.intervalID)
      this.intervalID = -1
    }
  }

  render() {
    const { children, ...restProps } = this.props

    if (Array.isArray(children)) {
      return <Text {...restProps}>{children[this.state.i]}</Text>
    }

    return <Text {...this.props} />
  }
}
