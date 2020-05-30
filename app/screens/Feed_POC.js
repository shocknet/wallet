// @ts-nocheck
import React from 'react'
import { Text, View, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import { connect } from 'react-redux'
import ShockWebView from '../components/ShockWebView'
import { WebView } from 'react-native-webview'
import FeedItem from '../components/FeedItem'
import notificationService from '../../notificationService'
import Http from 'axios'
import * as Thunks from '../thunks'

//import { updateSelectedFee, updateFeesSource } from '../actions/FeesActions'
//import ShockInput from '../components/ShockInput'
/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

export const FEED = 'FEED'

/**
 * @typedef {object} Props
 *
 */

/**
 * @typedef {object} State
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @augments React.Component<Props, State, never>
 */
class Feed extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  componentDidMount() {
    this.props.loadFeed(1)
  }

  render() {
    //notificationService.Log("TESTING",JSON.stringify(this.props.feed))
    /*const feedData = []
    this.props.feed.feed.forEach(element => {
      //notificationService.Log("TESTING",JSON.stringify(element))
      feedData.push(element.media[0])
    });
    notificationService.Log("TESTING",JSON.stringify(feedData))*/
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.props.feed}
          //eslint-disable-next-line
          renderItem={({ item }) => <FeedItem {...item} />}
          //eslint-disable-next-line
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    )
  }
}

/**
 * @param {typeof import('../../reducers/index').default} state
 */
const mapStateToProps = ({ feed }) => ({ feed })
/**@param {function} dispatch*/
const mapDispatchToProps = dispatch => {
  return {
    loadFeed: page => {
      dispatch(Thunks.Feed.loadFeed(page))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Feed)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 3,
  },
})
/*
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
