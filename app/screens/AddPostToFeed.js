//@ts-nocheck
import React from 'react'
import {
  Text,
  View /* StyleSheet, SafeAreaView, FlatList */,
} from 'react-native'
import { connect } from 'react-redux'
//import ShockWebView from '../components/ShockWebView'
//import { WebView } from 'react-native-webview'
//import FeedItem from '../components/FeedItem'
import { addPost } from '../actions/FeedActions'
//import notificationService from '../../notificationService'
//import Http from 'axios'
import ShockInput from '../components/ShockInput'
import ShockButton from '../components/ShockButton'

//import { updateSelectedFee, updateFeesSource } from '../actions/FeesActions'
//import ShockInput from '../components/ShockInput'
/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

export const ADD_POST_TO_FEED = 'ADD_POST_TO_FEED'

/**
 * @typedef {object} Props
 *
 */

/**
 * @typedef {object} State
 * @prop {string} paragraph
 * @prop {string} magnet
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @augments React.Component<Props, State, never>
 */
class AddPostToFeed extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /**
   * @param {string} t
   */
  updateParagraph = t => {
    this.setState({ paragraph: t })
  }

  /**
   * @param {string} t
   */
  updateMagnet = t => {
    this.setState({ paragraph: t })
  }

  render() {
    return (
      <View>
        <Text>Text</Text>
        <ShockInput onChangeText={this.updateParagraph} numberOfLines={4} />
        <Text>Magnet</Text>
        <ShockInput onChangeText={this.updateMagnet} numberOfLines={1} />
        <ShockButton />
        <Text>{this.state.paragraph}</Text>
        <Text>{this.state.magnet}</Text>
      </View>
    )
  }
}

/**
 * @param {typeof import('../../reducers/index').default} state
 */
const mapStateToProps = ({ feed }) => ({ feed })

const mapDispatchToProps = {
  addPost,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddPostToFeed)
/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 3,
  },
})

/**
 * @param {typeof import('../../reducers/index').default} state
 */
/*
const mapStateToProps = ({ fees }) => ({ fees })

const mapDispatchToProps = {
  updateSelectedFee,
  updateFeesSource,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletSettings)

const styles = StyleSheet.create({
  bigBold: {
    marginTop: 25,
    fontWeight: 'bold',
    fontSize: 24,
  },
  midBold: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  flexCenter: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  w_80: {
    width: '80%',
  },
  w_20: {
    alignItems: 'center',
    width: '20%',
  },
  d_flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  bottom: {
    position: 'absolute',
    bottom: 50,
  },
})
*/
