/**
 * @format
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
/**
 * @typedef {import('../../../services/wallet').Channel} Channel
 */

/**
 * @typedef {object} Props
 * @prop {Channel} data
 */

/**
 * @augments React.PureComponent<Props>
 */
export default class ChannelAccordion extends React.PureComponent {
  render() {
    const { data } = this.props

    return (
      <View
        style={[
          styles.channelItem,
          {
            borderBottomWidth: 1,
            borderColor: '#cdcdcd',
            borderStyle: 'solid',
          },
        ]}
      >
        <View style={styles.channelDetails}>
          <View style={styles.channelNameContainer}>
            <Text style={styles.channelIp}>{`IP: ${data.ip}`}</Text>
            <View
              style={[
                styles.channelStatus,
                {
                  backgroundColor: data.active ? '#39b54a' : '#c1272d',
                },
              ]}
            />
          </View>
          <Text
            style={styles.channelPublicKey}
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            Address: {data.remote_pubkey}
          </Text>
          <View style={styles.channelStats}>
            <View
              style={[
                styles.channelStat,
                {
                  borderStyle: 'solid',
                  borderRightWidth: 1,
                  borderColor: '#7e7b7b',
                },
              ]}
            >
              <Text style={styles.channelStatText}>
                Sendable: {data.local_balance} sats
              </Text>
            </View>
            <View
              style={[
                styles.channelStat,
                {
                  alignItems: 'flex-end',
                },
              ]}
            >
              <Text style={styles.channelStatText}>
                Receivable: {data.remote_balance} sats
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  channelItem: {
    width: '100%',
    backgroundColor: 'white',
  },
  channelDetails: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  channelIp: {
    color: '#6b6b6b',
    opacity: 0.5,
    marginBottom: 3,
  },
  channelNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  channelName: {
    color: '#6b6b6b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  channelPublicKey: {
    color: '#b6b4b4',
    marginBottom: 5,
  },
  channelStatus: {
    height: 10,
    width: 10,
    marginLeft: 5,
    borderRadius: 100,
  },
  channelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelStat: {
    width: '49%',
  },
  channelStatText: {
    fontWeight: 'bold',
    color: '#7e7b7b',
  },
  transactionDetails: {
    flexDirection: 'row',
    width: '50%',
  },
  transactionIcon: {
    marginRight: 15,
    width: 40,
    height: 40,
  },
  transactionHashText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999999',
  },
  transactionValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b6b6b',
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
  },
})
