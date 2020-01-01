import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Moment from 'moment'

import * as CSS from '../../../res/css'
/**
 * @typedef {import('../../../services/wallet').Transaction} ITransaction
 */
/** @type {number} */
//@ts-ignore
const paymentIcon = require('../../../assets/images/payment-icon.png')

/**
 * @typedef {object} Props
 * @prop {ITransaction} data
 */

/**
 * @type {React.FC<Props>}
 */
const _Transaction = ({ data }) => ((
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
          {data.tx_hash}
        </Text>
        <Text>Payment</Text>
      </View>
    </View>
    <View>
      <Text style={styles.transactionValueText}>{data.amount}</Text>
      <Text style={styles.transactionTime}>
        {Moment(data.time_stamp).fromNow()}
      </Text>
    </View>
  </View>
))

const Transaction = React.memo(_Transaction)

export default Transaction

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: CSS.Colors.BORDER_NEAR_WHITE,
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
    color: CSS.Colors.TEXT_LIGHTEST,
  },
  transactionValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CSS.Colors.TEXT_LIGHT,
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
  },
})
