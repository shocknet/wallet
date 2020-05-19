import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import ShockWebView from './ShockWebView'
import { newLogo } from '../res'
import Pad from '../components/Pad'

// @ts-ignore
export default function FeedItem({ ratio_x, ratio_y, magnet }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image source={newLogo} style={styles.image} />
        <Text style={styles.title}>USERNAME</Text>
      </View>

      <Text>
        A purely peer-to-peer version of electronic cash would allow online
        payments to be sent directly from one party to another without going
        through a financial institution. Digital signatures provide part of the
        solution, but the main benefits are lost if a trusted third party is
        still required to prevent double-spending. We propose a solution to the
        double-spending problem using a peer-to-peer network
      </Text>
      <ShockWebView ratio_x={ratio_x} ratio_y={ratio_y} magnet={magnet} />
      <Pad amount={10} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    marginBottom: 3,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  title: {
    fontSize: 32,
  },
  image: {
    width: 100,
    height: 100,
  },
})
