import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { connect } from 'react-redux'

import { Colors } from '../res/css'
import * as ContactAPI from '../services/contact-api'
import { isOnline, State as StoreState } from '../../store'

interface DispatchProps {}

interface StateProps {
  connected: boolean
}

interface OwnProps {
  children: React.ReactNode
  disable?: boolean
}

type Props = DispatchProps & StateProps & OwnProps

/**
 * @typedef {object} Props
 * @prop {boolean=} disable
 */

interface State {
  connected: boolean
}

export class WithConnWarning extends React.PureComponent<Props, State> {
  state: State = {
    connected: true,
  }

  /**
   * @private
   */
  connUnsub = () => {}

  componentDidMount() {
    this.connUnsub = ContactAPI.Events.onConnection(this.onConn)
  }

  componentWillUnmount() {
    this.connUnsub()
  }

  /**
   * @private
   */
  onConn = (connected: boolean) => {
    this.setState({
      connected,
    })
  }

  render() {
    const { children, disable } = this.props
    const { connected } = this.state

    if (!!disable || connected) {
      return children
    }

    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.flex}>{children}</View>

        <View style={styles.banner}>
          <Text style={styles.text}>Disconnected from server</Text>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.FAILURE_RED,
    height: 24,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },

  flex: {
    flex: 1,
  },

  text: {
    color: Colors.TEXT_WHITE,
  },
})

const mapState = (state: StoreState): StateProps => ({
  connected: isOnline(state),
})

const ConnectedWithConnWarning = connect(mapState)(WithConnWarning)

export default ConnectedWithConnWarning
