//@ts-nocheck
import React from 'react'
import {
  Text,
  View /* StyleSheet, SafeAreaView, FlatList */,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'
import ShockInput from '../components/ShockInput'
import ShockButton from '../components/ShockButton'
import Pad from '../components/Pad'
import * as Thunks from '../store/thunks'
import notificationService from '../../notificationService'

/** @type {number} */
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
 * @prop {string} userPubKey
 */

/** @type {State} */
const DEFAULT_STATE = {
  paragraph: '',
  magnet: '',
  userPubKey: '',
}

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @augments React.PureComponent<Props, State, never>
 */
class AddPostToFeed extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    headerShown: false,
  }

  /** @type {State} */
  state = DEFAULT_STATE

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

  addPost = () => {
    //const { addPost } = this.props
    const { paragraph, magnet } = this.state
    const post = {
      id: '',
      paragraphs: [paragraph],
      media: [
        {
          magnetUri: magnet,
          width: 0,
          height: 0,
        },
      ],
    }
    //addPost(post)
  }

  /**
   * @param {string} k
   */
  updateUserPubKey = k => {
    this.setState({ userPubKey: k })
  }

  follow = () => {
    notificationService.Log('TESTING', 'STEP 1')
    const { userPubKey } = this.state
    this.props.follow(userPubKey)
  }

  render() {
    const { follows } = this.props
    const generateFollows = () => {
      const followsArray = Object.values(follows)
      if (followsArray.length === 0) {
        return <Text>You are following no one</Text>
      }
      return followsArray.map(follow => {
        return (
          <View key={follow.user}>
            <Text>You are following:</Text>
            <Text>{follow.user}</Text>
            <Text>{follow.status}</Text>
          </View>
        )
      })
    }
    return (
      <SafeAreaView>
        <ScrollView>
          <Pad amount={15} />
          <Text>Text</Text>
          <ShockInput onChangeText={this.updateParagraph} numberOfLines={4} />
          <Text>Magnet</Text>
          <ShockInput onChangeText={this.updateMagnet} numberOfLines={1} />
          <ShockButton title="POST" />
          <Text>{this.state.paragraph}</Text>
          <Text>{this.state.magnet}</Text>
          <Pad amount={15} />
          <Text>Pub Key</Text>
          <ShockInput onChangeText={this.updateUserPubKey} numberOfLines={4} />
          <ShockButton title="FOLLOW" onPress={this.follow} />
          <View>{generateFollows()}</View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

/**
 * @param {typeof import('../store/reducers/index').default} state
 */
const mapStateToProps = ({ follows }) => ({ follows })

/**@param {function} dispatch*/
const mapDispatchToProps = dispatch => {
  return {
    /** @param {string} pk */
    follow: pk => {
      notificationService.Log('TESTING', 'STEP 2')
      dispatch(Thunks.Follows.follow(pk))
    },
  }
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
