import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

import * as CSS from '../../../res/css'
/**
 * @typedef {import('../../../services/wallet').Peer} IPeer
 */

/** @type {number} */
const paymentIcon = require('../../../assets/images/payment-icon.png')

/**
 * @typedef {object} Props
 * @prop {IPeer} data
 */

/**
 * @type {React.FC<Props>}
 */
const _Peer = ({ data }) => ((
  <View style={styles.transactionItem}>
    <View style={styles.transactionDetails}>
      <Image
        style={styles.transactionIcon}
        source={paymentIcon}
        resizeMode="contain"
      />
      <View>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={styles.transactionHashText}
        >
          {data.address}
        </Text>
        <Text ellipsizeMode="middle" numberOfLines={1} style={styles.pubKey}>
          {data.pub_key}
        </Text>
      </View>
    </View>
    <View>
      <Text style={styles.transactionTime}>
        Sent: {parseFloat(data.sat_sent).toFixed(2)} sats
      </Text>
      <Text style={styles.transactionTime}>
        Received: {parseFloat(data.sat_recv).toFixed(2)} sats
      </Text>
    </View>
  </View>
))

/**
 * @type {React.FC<Props>}
 */
const Peer = React.memo(_Peer)

export default Peer

const styles = StyleSheet.create({
  pubKey: {
    fontSize: 10,
    opacity: 0.7,
    color: CSS.Colors.TEXT_WHITE,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: CSS.Colors.BORDER_WHITE,
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
    color: CSS.Colors.TEXT_WHITE,
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
    color: CSS.Colors.TEXT_WHITE,
  },
})
