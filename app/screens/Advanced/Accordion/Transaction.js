import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Clipboard,
  ToastAndroid,
} from 'react-native'
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
          onPress={copyTxHash(data.tx_hash)}
        >
          {data.tx_hash}
        </Text>
        <Text>
          Payment{' '}
          {parseInt(data.num_confirmations, 10) === 0 ? (
            <EntypoIcons name="clock" color="red" size={10} />
          ) : null}
        </Text>
      </View>
    </View>
    <View>
      <Text style={styles.transactionValueText}>{data.amount}</Text>
      <Text style={styles.transactionTime}>
        {Moment.utc(parseInt(data.time_stamp, 10) * 1000).fromNow()}
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
