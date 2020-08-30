/**
 * @format
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
/**
 * @typedef {import('../../../services/wallet').Channel} Channel
 * @typedef {import('../../../services/wallet').PendingChannel} PendingChannel
 */

import * as CSS from '../../../res/css'

/**
 * @typedef {object} Props
 * @prop {Channel|PendingChannel} data
 */

/**
 * @type {React.FC<Props>}
 */
const _ChannelAccordion = ({ data }) => {
  const pub =
    data.type === 'channel' ? data.remote_pubkey : data.remote_node_pub
  const theme = 'dark'

  return ((
    <View
      style={theme === 'dark' ? styles.channelItemDark : styles.channelItem}
    >
      <View style={styles.channelDetails}>
        <View style={styles.channelNameContainer}>
          {data.type === 'channel' && (
            <>
              <Text
                style={
                  theme === 'dark' ? styles.channelIpDark : styles.channelIp
                }
              >
                {`IP: ${data.ip}`}
              </Text>
              <View
                style={[
                  styles.channelStatus,
                  {
                    backgroundColor: data.active
                      ? CSS.Colors.SUCCESS_GREEN
                      : CSS.Colors.FAILURE_RED,
                  },
                ]}
              />
            </>
          )}
          {data.type !== 'channel' && (
            <>
              <Text
                style={
                  theme === 'dark' ? styles.channelIpDark : styles.channelIpDark
                }
              >
                {getStatus(data)}
              </Text>

              <View
                style={[
                  styles.channelStatus,
                  {
                    backgroundColor: CSS.Colors.FAILURE_RED,
                  },
                ]}
              />
            </>
          )}
        </View>
        <Text
          style={
            theme === 'dark'
              ? styles.channelPublicKeyDark
              : styles.channelPublicKey
          }
          ellipsizeMode="middle"
          numberOfLines={1}
        >
          Address: {pub}
        </Text>
        <View style={styles.channelStats}>
          <View
            style={[
              styles.channelStat,
              theme === 'dark'
                ? styles.sendableSatsBorderDark
                : styles.sendableSatsBorder,
            ]}
          >
            <Text
              style={
                theme === 'dark'
                  ? styles.channelStatTextDark
                  : styles.channelStatText
              }
            >
              Sendable: {data.local_balance} sats
            </Text>
          </View>
          <View style={[styles.channelStat, CSS.styles.alignItemsEnd]}>
            <Text
              style={
                theme === 'dark'
                  ? styles.channelStatTextDark
                  : styles.channelStatText
              }
            >
              Receivable: {data.remote_balance} sats
            </Text>
          </View>
        </View>
      </View>
    </View>
  ))
}

const ChannelAccordion = React.memo(_ChannelAccordion)

export default ChannelAccordion
/**
 *
 * @param {PendingChannel} channel
 * @returns {string}
 */
const getStatus = channel => {
  switch (channel.type) {
    case 'pendingOpen':
      return 'Pending Open'
    case 'pendingClose':
      return 'Pending Close'
    case 'pendingForceClose':
      return 'Pending Force Close'
    default:
      return ''
  }
}

const styles = StyleSheet.create({
  channelItem: {
    width: '100%',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    borderBottomWidth: 1,
    borderColor: CSS.Colors.GRAY_LIGHT,
    borderStyle: 'solid',
  },
  channelItemDark: {
    width: '100%',
    backgroundColor: '#16191C',
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
    borderStyle: 'solid',
  },
  channelDetails: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  channelIp: {
    color: CSS.Colors.TEXT_GRAY,
    opacity: 0.5,
    marginBottom: 3,
  },
  channelIpDark: {
    color: '#EBEBEB',
    marginBottom: 3,
    fontFamily: 'Montserrat-600',
    fontSize: 11,
  },
  channelNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  channelPublicKey: {
    color: CSS.Colors.TEXT_GRAY_LIGHTEST,
    marginBottom: 5,
  },
  channelPublicKeyDark: {
    color: '#EBEBEB',
    marginBottom: 5,
    fontFamily: 'Montserrat-600',
    fontSize: 11,
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
    color: CSS.Colors.TEXT_GRAY,
  },
  channelStatTextDark: {
    fontWeight: 'bold',
    color: '#EBEBEB',
    fontFamily: 'Montserrat-700',
    fontSize: 12,
  },
  sendableSatsBorder: {
    borderStyle: 'solid',
    borderRightWidth: 1,
    borderColor: CSS.Colors.GRAY_LIGHT,
  },
  sendableSatsBorderDark: {
    borderStyle: 'solid',
    borderRightWidth: 1,
    borderColor: '#EBEBEB',
  },
})
