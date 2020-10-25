import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { connect } from 'react-redux'

import { Colors } from '../res/css'
import { isOnline, State as StoreState } from '../store'

interface DispatchProps {}

interface StateProps {
  connected: boolean
}

interface OwnProps {
  children: React.ReactNode
  disable?: boolean
}

type Props = DispatchProps & StateProps & OwnProps

export class WithConnWarning extends React.PureComponent<Props> {
  render() {
    // Special care must be had inside <WithConnWarning />: don't remount
    // children. It causes problems if any of those is a navigation stack or
    // some other special-type component
    const { connected, children, disable } = this.props

    const showBanner = !disable && !connected

    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.flex}>{children}</View>

        {showBanner && (
          <View style={styles.banner}>
            <Text style={styles.text}>Disconnected from server</Text>
          </View>
        )}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.FAILURE_RED,
    height: 24,
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
