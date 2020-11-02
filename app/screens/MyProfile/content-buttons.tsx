import React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'

import Pad from '../../components/Pad'
import OfferProduct from '../../assets/images/profile/offer-product.svg'
import OfferService from '../../assets/images/profile/offer-service.svg'
import PublishContent from '../../assets/images/profile/publish-content.svg'
import CreatePost from '../../assets/images/profile/create-post.svg'

interface Props {
  onPressPublish(): void
  onPressCreate(): void
}

export default class ContentButtons extends React.PureComponent<Props> {
  render() {
    return (
      <View>
        <Pad amount={300} />
        <TouchableOpacity style={styles.actionButtonDark}>
          <OfferProduct />
          <Text style={styles.actionButtonTextDark}>Offer a Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonDark}>
          <OfferService />
          <Text style={styles.actionButtonTextDark}>Offer a Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonDark}
          onPress={this.props.onPressPublish}
        >
          <PublishContent />
          <Text style={styles.actionButtonTextDark}>Publish Content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonDark}
          onPress={this.props.onPressCreate}
        >
          <CreatePost />
          <Text style={styles.actionButtonTextDark}>Create a Post</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  actionButtonDark: {
    width: '100%',
    height: 79,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(33, 41, 55, .7)',
    borderColor: '#4285B9',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 7,
    flexDirection: 'row',
    paddingLeft: '30%',
  },
  actionButtonTextDark: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    marginLeft: 20,
  },
})
