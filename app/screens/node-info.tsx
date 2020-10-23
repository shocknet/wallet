import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { NavigationEvents } from 'react-navigation'
import { connect } from 'react-redux'
import { StackNavigationOptions } from 'react-navigation-stack/lib/typescript/src/vendor/types'

import * as CSS from '../res/css'
import {
  SettingOrData,
  SmallData,
  headerStyle,
  headerTitleStyle,
  headerBackImage,
} from '../components/settings'
import { NodeInfo as INodeInfo } from '../schema'
import * as Actions from '../store/actions'
import Pad from '../components/Pad'
import * as Store from '../store'

export const NODE_INFO = 'NODE_INFO'

interface DispatchProps {
  fetch(): void
}

type StateProps = INodeInfo

interface OwnProps {}

type Props = DispatchProps & StateProps & OwnProps

class NodeInfo extends React.PureComponent<Props> {
  static navigationOptions: StackNavigationOptions = {
    title: 'WALLET SETTINGS',

    headerStyle,

    headerTitleAlign: 'center',

    headerTitleStyle,

    headerBackImage,
  }

  mounted = false

  componentDidMount() {
    this.mounted = true
    this.props.fetch()
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const PAD_AMT = 48
    const {
      synced_to_chain,
      synced_to_graph,
      identity_pubkey,
      uris,
      num_pending_channels,
      block_height,
      best_header_timestamp,
      version,
    } = this.props
    return (
      <>
        <NavigationEvents onWillFocus={this.props.fetch} />
        <ScrollView
          style={CSS.styles.flex}
          contentContainerStyle={styles.container}
        >
          <View style={styles.smallDataContainer}>
            <SmallData
              title="Synced to Chain"
              icon={synced_to_chain ? 'check' : 'clock'}
            />

            <SmallData
              title="Synced to Graph"
              icon={synced_to_graph ? 'check' : 'clock'}
            />

            <SmallData
              title="Pending Channels"
              subtitle={num_pending_channels.toString()}
            />
          </View>

          <Pad amount={PAD_AMT} />

          <View style={styles.smallDataContainer}>
            <SmallData
              title="Block height:"
              subtitle={block_height.toString()}
            />

            <SmallData
              title="Best Header Timestamp:"
              subtitle={best_header_timestamp}
            />
          </View>

          <Pad amount={PAD_AMT} />

          <SettingOrData
            title="Lightning PubKey"
            subtitle={identity_pubkey}
            rightSide="copy"
          />

          <Pad amount={PAD_AMT} />

          <SettingOrData
            title="Uris"
            subtitle={`Number of Uris: ${uris.length}`}
            rightSide="copy"
          />

          <Pad amount={PAD_AMT} />

          <SettingOrData
            title="LND Version"
            subtitle={version}
            rightSide="copy"
          />

          <Pad amount={PAD_AMT} />

          <Text style={styles.footer}>
            <Text style={styles.warning}>Warning: </Text> Consult documentation
            before use.
          </Text>
        </ScrollView>
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_DARK,
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 40,
  },

  smallDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  footer: {
    // alignSelf: 'center',
    textAlign: 'center',
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
  },

  warning: {
    color: 'red',
  },
})

const mapState = (state: Store.State): StateProps => state.node.nodeInfo

const mapDispatch: DispatchProps = {
  fetch: Actions.fetchNodeInfo,
}

const ConnectedNodeInfo = connect(
  mapState,
  mapDispatch,
)(NodeInfo)

export default ConnectedNodeInfo
