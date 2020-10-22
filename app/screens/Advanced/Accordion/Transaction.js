import React from 'react'
import { View, Text, StyleSheet, Clipboard, ToastAndroid } from 'react-native'
import Moment from 'moment'
import EntypoIcons from 'react-native-vector-icons/Entypo'

import * as CSS from '../../../res/css'
/**
 * @typedef {import('../../../services/wallet').Transaction} ITransaction
 */
/** @type {number} */
//@ts-ignore
const paymentIcon = require('../../../assets/images/payment-icon.png')
//const blockExplorer = 'https://blockstream.info/tx/'

/**
 * @typedef {object} Props
 * @prop {ITransaction} data
 */

/**
 *
 * @param {string} url
 */
const copyTxHash = url => () => {
  Clipboard.setString(url)
  ToastAndroid.show('Tx hash copied to clipboard', 800)
  return true
}

const theme = 'dark'
/**
 * @type {React.FC<Props>}
 */
const _Transaction = ({ data }) => ((
  <View
    style={
      theme === 'dark' ? styles.transactionItemDark : styles.transactionItem
    }
  >
    <View style={styles.transactionDetails}>
      <EntypoIcons
        name="link"
        color="white"
        size={40}
        style={styles.transactionIcon}
      />
      <View>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={
            theme === 'dark'
              ? styles.transactionHashTextDark
              : styles.transactionHashText
          }
          onPress={copyTxHash(data.tx_hash)}
        >
          {data.tx_hash}
        </Text>
        <Text style={styles.textWhite}>
          Payment{' '}
          {parseInt(data.num_confirmations, 10) === 0 ? (
            <EntypoIcons name="clock" color="red" size={10} />
          ) : null}
        </Text>
      </View>
    </View>
    <View>
      <Text
        style={
          theme === 'dark'
            ? styles.transactionValueTextDark
            : styles.transactionValueText
        }
      >
        {data.amount}
      </Text>
      <Text style={styles.transactionTime}>
        {Moment.utc(parseInt(data.time_stamp, 10) * 1000).fromNow()}
      </Text>
    </View>
  </View>
))

const Transaction = React.memo(_Transaction)

export default Transaction

const styles = StyleSheet.create({
  textWhite: {
    color: CSS.Colors.TEXT_WHITE,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: CSS.Colors.BORDER_NEAR_WHITE,
  },
  transactionItemDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: CSS.Colors.TEXT_WHITE,
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
  transactionHashTextDark: {
    fontSize: 12,
    color: '#EBEBEB',
    fontFamily: 'Montserrat-700',
  },
  transactionValueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CSS.Colors.TEXT_LIGHT,
  },
  transactionValueTextDark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EBEBEB',
    fontFamily: 'Montserrat-600',
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
    color: CSS.Colors.TEXT_WHITE,
  },
})
