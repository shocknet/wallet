import React, { Component } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
/** @type {number} */
//@ts-ignore
const paymentIcon = require('../../../assets/images/payment-icon.png')

export default class Transaction extends Component {
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
              {data.address}
            </Text>
            <Text
              ellipsizeMode="middle"
              numberOfLines={1}
              style={{ fontSize: 10, opacity: 0.7 }}
            >
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b6b6b',
  },
  transactionTime: {
    textAlign: 'right',
    fontSize: 10,
  },
})
