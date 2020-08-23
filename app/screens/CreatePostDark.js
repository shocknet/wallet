import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ImageBackground,
  FlatList,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import * as CSS from '../res/css'
import Pad from '../components/Pad'
import InputGroup from '../components/InputGroup'

// @ts-ignore
import ArrowLeft from '../assets/images/arrow-left.svg'
// @ts-ignore
import PublicIcon from '../assets/images/create-post/public.svg'
// @ts-ignore
import SubscribersIcon from '../assets/images/create-post/subscribers.svg'
// @ts-ignore
import PaywallIcon from '../assets/images/create-post/paywall.svg'

import DropDownPicker from 'react-native-dropdown-picker'
import Icon from 'react-native-vector-icons/Feather'

export const CREATE_POST_DARK = 'CREATE_POST_DARK'

/**
 * @typedef {object} Props
 * @prop {any} navigation
 */

/**
 * @typedef {object} State
 * @prop {string} shareMode
 * @prop {any[]} images
 * @prop {string} description
 */

/** @type {State} */
const DEFAULT_STATE = {
  shareMode: 'public',
  description: '',
  images: [],
}

/**
 * @augments React.Component<Props, State, never>
 */
class CreatePostDark extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  state = DEFAULT_STATE

  goBack = () => {
    this.props.navigation.goBack()
  }

  /**
   * @param {{ value: any; }} item
   */
  onChangeShareMode = item => {
    this.setState({
      shareMode: item.value,
    })
  }

  // @ts-ignore
  _renderPostItem = item => {
    return (
      <View style={styles.postContainer}>
        <ImageBackground
          source={item.image}
          resizeMode="cover"
          style={styles.postImageBackground}
        >
          {item.offer && (
            <View style={styles.offerPost}>
              <FontAwesome name="check-circle" size={36} color="white" />
            </View>
          )}
        </ImageBackground>
      </View>
    )
  }

  render() {
    const testDatas = [
      {
        image: {
          uri:
            'https://strapya.typepad.com/photos/kawaii_keitai_strap_colle/7swpm012v.jpg',
        },
        offer: false,
      },
      {
        image: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        offer: true,
      },
      {
        image: {
          uri:
            'https://dukeofyorksquare.com/wp-content/uploads/2017/02/Pancakes-2.jpg',
        },
      },
      {
        image: {
          uri:
            'https://mariettasquaremarket.com/wp-content/uploads/2018/12/Pita-Mediterranean-5.jpg',
        },
      },
      {
        image: {
          uri:
            'https://www.pietrzaka030.macombserver.net/itwp1000/webproject4/images/basil.jpg',
        },
      },
    ]
    return (
      <View style={styles.mainContainer}>
        <View style={styles.subContainerDark}>
          <View style={styles.upperContainer}>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={this.goBack}>
                <ArrowLeft size={19} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.caption}>Say Something</Text>
            </View>
            <Pad amount={32} />
            <InputGroup
              value={this.state.description}
              label="Description"
              multiline
              inputStyle={styles.descInputDark}
              labelStyle={styles.labelDark}
              style={styles.descContainer}
              placeholder="Order our famouse souce and dry rubs"
            />
            <View style={styles.dropdownContainerView}>
              <DropDownPicker
                items={[
                  {
                    label: 'Public',
                    value: 'public',
                    icon: () => <PublicIcon />,
                  },
                  {
                    label: 'Subscribers',
                    value: 'subscribers',
                    icon: () => <SubscribersIcon />,
                  },
                  {
                    label: 'Paywall',
                    value: 'paywall',
                    icon: () => <PaywallIcon />,
                  },
                ]}
                defaultValue={this.state.shareMode}
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
                itemStyle={styles.dropdownItem}
                dropDownStyle={styles.dropdownDropdown}
                onChangeItem={this.onChangeShareMode}
                labelStyle={styles.dropdownLabel}
                arrowColor="#B2B2B2"
              />
            </View>
          </View>
          <View style={styles.horizontalLine} />
          <View style={styles.belowContainer}>
            <View style={styles.contentTypes}>
              <TouchableOpacity style={styles.contentType1}>
                <Icon name="check" color="white" size={15} />
                <Text style={styles.contentTypeText1}>Offers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contentType2}>
                <Text style={styles.contentTypeText2}>Content</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.postsCarousel}>
              <FlatList
                data={testDatas}
                renderItem={this._renderPostItem}
                horizontal
              />
            </View>
            <View style={styles.actionButtonsDark}>
              <TouchableHighlight
                underlayColor="transparent"
                style={styles.actionButtonDark1}
              >
                <Text style={styles.actionButtonTextDark1}>Cancel</Text>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="transparent"
                style={styles.actionButtonDark2}
              >
                <Text style={styles.actionButtonTextDark2}>Save</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default CreatePostDark

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'rgba(22, 25, 28, .94)',
    paddingVertical: 50,
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
  dropdownContainerView: {
    alignItems: 'flex-end',
    marginRight: -4,
  },
  dropdownContainer: {
    height: 33,
    width: '40%',
  },
  dropdown: {
    backgroundColor: '#001220',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  dropdownItem: {
    justifyContent: 'flex-start',
  },
  dropdownDropdown: {
    backgroundColor: '#001220',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: -34,
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  dropdownLabel: {
    color: '#BBB8B8',
    fontFamily: 'Montserrat-600',
    textAlignVertical: 'center',
    fontSize: 12,
  },
  horizontalLine: {
    width: '100%',
    borderColor: '#4285B9',
    borderWidth: 1,
    marginTop: 37.5,
    marginBottom: 27.5,
  },
  contentTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25,
    marginBottom: 12,
  },
  contentType1: {
    width: '48%',
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderColor: '#4285B9',
    borderWidth: 1,
    flexDirection: 'row',
  },
  contentType2: {
    width: '48%',
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
    flexDirection: 'row',
  },
  contentTypeText1: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 12,
    marginLeft: 10,
  },
  contentTypeText2: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 12,
  },
  upperContainer: {
    paddingHorizontal: 20,
  },
  belowContainer: {
    paddingHorizontal: 20,
  },
  postsCarousel: {
    paddingVertical: 40,
  },
  offerPost: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, .57)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContainer: {
    width: 91,
    height: 91,
    marginRight: 21,
  },
  postImageBackground: {
    width: 91,
    height: 91,
  },
})
