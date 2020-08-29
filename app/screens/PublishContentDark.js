//@ts-nocheck
import React from 'react'
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
  TouchableHighlight,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Logger from 'react-native-file-log'
import _ from 'lodash'
import Http from 'axios'

import TextInput from '../components/TextInput'
import ShockButton from '../components/ShockButton'
import * as CSS from '../res/css'
import Modal from 'react-native-modal'
import ArrowLeft from '../assets/images/arrow-left.svg'
import Pad from '../components/Pad'
import InputGroup from '../components/InputGroup'

import HeroImage from '../assets/images/publish-content/image.svg'
import ContentImages from '../assets/images/publish-content/images.svg'
import ContentVideo from '../assets/images/publish-content/video.svg'
import ContentMusic from '../assets/images/publish-content/music.svg'
import ContentFile from '../assets/images/publish-content/file.svg'
import CheckBox from 'react-native-check-box'

export const PUBLISH_CONTENT_DARK = 'PUBLISH_CONTENT_DARK'

/**
 * @typedef {object} Props
 * @prop {((paragraphs: string[], images: string[]) => void)=} onPressCreate
 */

/**
 * @typedef {object} State
 * @prop {boolean} isCreating
 * @prop {any[]} images
 * @prop {string} description
 */

/** @type {State} */
const DEFAULT_STATE = {
  description: '',
  images: [],
  isPostOrTeaser: false,
}

/**
 * @augments React.Component<Props, State, never>
 */
class PublishContentDark extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  state = DEFAULT_STATE

  onPressPostOrTeaser = () => {
    if (this.state.isPostOrTeaser) {
      this.setState({ isPostOrTeaser: false })
    } else {
      this.setState({ isPostOrTeaser: true })
    }
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <ScrollView>
          <View style={styles.subContainerDark}>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={this.goBack}>
                <ArrowLeft size={19} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.caption}>Publish Content</Text>
            </View>
            <Pad amount={32} />
            <InputGroup
              label="Title"
              value=""
              // onChange={}
              style={styles.inputGroup}
              labelStyle={styles.labelDark}
              placeholder="How I monetized my content with ShockWallet"
            />
            <View style={styles.heroImage}>
              <Text style={styles.labelDark}>Hero Image</Text>
              <HeroImage />
            </View>
            <View style={styles.contentsContainer}>
              <Text style={styles.labelDark}>Contents</Text>
              <View style={styles.contentIcons}>
                <View style={styles.contentIcon}>
                  <ContentImages />
                </View>
                <View style={styles.contentIcon}>
                  <ContentVideo />
                </View>
                <View style={styles.contentIcon}>
                  <ContentMusic />
                </View>
                <View style={styles.contentIcon}>
                  <ContentFile />
                </View>
              </View>
            </View>
            <InputGroup
              label="Description"
              multiline
              inputStyle={styles.descInputDark}
              labelStyle={styles.labelDark}
              style={styles.descContainer}
              placeholder="I made a quick video to show you guys how easy it is to run your own social platform on ShockWallet, and start earning Bitcoin"
            />
            <View style={styles.checkboxContainer}>
              <CheckBox
                style={styles.checkbox}
                leftText="Create Post/Teaser"
                onClick={this.onPressPostOrTeaser}
                isChecked={this.state.isPostOrTeaser}
                leftTextStyle={styles.labelCheckbox}
                checkBoxColor="#BBB8B8"
              />

              {/*<Text style={styles.labelCheckbox}>Create Post/Teaser</Text>*/}
            </View>

            <View style={styles.actionButtonsDark}>
              <TouchableHighlight
                underlayColor="transparent"
                style={styles.actionButtonDark1}
              >
                <Text style={styles.actionButtonTextDark1}>Discard</Text>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="transparent"
                style={styles.actionButtonDark2}
              >
                <Text style={styles.actionButtonTextDark2}>Publish</Text>
              </TouchableHighlight>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default PublishContentDark

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#16191C',
    paddingVertical: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  subContainerDark: {
    flexDirection: 'column',
  },
  backButton: {
    alignItems: 'flex-start',
  },
  caption: {
    fontFamily: 'Montserrat-700',
    fontSize: 20,
    color: '#F3EFEF',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: '100%',
  },
  actionButtonsDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  actionButtonDark1: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#001220',
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  actionButtonDark2: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#4285B9',
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
  },
  actionButtonTextDark1: {
    color: '#4285B9',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  actionButtonTextDark2: {
    color: '#212937',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  labelDark: {
    fontSize: 15,
    color: '#BBBBBB',
    fontFamily: 'Montserrat-600',
    marginBottom: 11,
    paddingLeft: 7,
  },
  descInputDark: {
    height: 90,
    textAlignVertical: 'top',
  },
  descContainer: {
    marginBottom: 0,
  },
  heroImage: {
    flexDirection: 'column',
    marginBottom: 25,
    paddingLeft: 7,
  },
  contentsContainer: {
    flexDirection: 'column',
    marginBottom: 25,
    paddingLeft: 7,
  },
  contentIcons: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  labelCheckbox: {
    color: '#BBB8B8',
    fontFamily: 'Montserrat-600',
    textAlignVertical: 'center',
    textAlign: 'right',
    fontSize: 12,
  },
  checkbox: {
    flex: 1,
    padding: 10,
  },
  contentIcon: {
    marginRight: 35,
  },
  inputGroup: {
    marginBottom: 20,
  },
})
