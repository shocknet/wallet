import React, { Component } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Moment from 'moment'
/** @type {number} */
//@ts-ignore
const paymentIcon = require('../../../assets/images/payment-icon.png')

const INVOICE_STATES = ['Open', 'Settled', 'Cancelled', 'Accepted']
export default class Invoice extends Component {
  state = {
    open: false,
  }

  componentDidMount() {
    const { open } = this.props
    this.setState({
      open,
    })
  }

  render() {
    const { data = {} } = this.props
    return (
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
            <Text>Invoice State: {INVOICE_STATES[parseInt(data.state)]}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.transactionTime}>
            {Moment(data.timestamp).fromNow()} ago
          </Text>
          <Text style={styles.transactionValueText}>+{data.amt_paid_sat}</Text>
          <Text style={styles.transactionUSDText}>
            {(data.amt_paid_sat / 100).toFixed(4)} USD
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  accordionItem: {
    width: '100%',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ddd',
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
    fontSize: 15,
    color: '#6b6b6b',
  },
  transactionUSDText: {
    color: '#f5a623',
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
  },
})
