import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

import * as CSS from '../../../res/css'
import TimeText from '../../../components/time-text'
/**
 * @typedef {import('../../../services/wallet').Invoice} IInvoice
 */

/** @type {number} */
const paymentIcon = require('../../../assets/images/payment-icon.png')

/**
 * @typedef {object} Props
 * @prop {IInvoice} data
 */

/**
 * @type {React.FC<Props>}
 */
const _Invoice = ({ data }) => ((
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
          {JSON.stringify(data.r_preimage)}
        </Text>
        <Text>Invoice State: {data.state}</Text>
      </View>
    </View>
    <View>
      <TimeText style={styles.transactionTime}>
        {Number(data.settle_date)}
      </TimeText>
      <Text style={styles.transactionValueText}>+{data.amt_paid_sat}</Text>
      <Text style={styles.transactionUSDText}>
        {(Number(data.amt_paid_sat) / 100).toFixed(4)} USD
      </Text>
    </View>
  </View>
))

const Invoice = React.memo(_Invoice)

export default Invoice

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: CSS.Colors.TEXT_GRAY_LIGHT,
  },
  transactionValueText: {
    fontSize: 15,
    color: CSS.Colors.TEXT_GRAY,
  },
  transactionUSDText: {
    color: CSS.Colors.ORANGE,
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
  },
})
