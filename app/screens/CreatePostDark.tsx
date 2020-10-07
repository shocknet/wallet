import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'
import Http from 'axios'
import Logger from 'react-native-file-log'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import * as CSS from '../res/css'
import Pad from '../components/Pad'
import InputGroup from '../components/InputGroup'

import ArrowLeft from '../assets/images/arrow-left.svg'
import PublicIcon from '../assets/images/create-post/public.svg'
import SubscribersIcon from '../assets/images/create-post/subscribers.svg'
import PaywallIcon from '../assets/images/create-post/paywall.svg'

import DropDownPicker from 'react-native-dropdown-picker'
//import Icon from 'react-native-vector-icons/Feather'
import ShockWebView from '../components/ShockWebView'
import { CompleteAnyMedia } from '../services/mediaLib'

export const CREATE_POST_DARK = 'CREATE_POST_DARK'

type Props = {
  navigation: import('react-navigation').NavigationScreenProp<{}, {}>
  mediaLib: import('../../reducers/mediaLib').State
}

/**
 * @typedef {object} SelectedFile
 * @prop {string} fileName
 * @prop {string} type
 * @prop {string} path
 * @prop {string} uri
 * @prop {string=} name
 */

type State = {
  isCreating: boolean
  shareMode: 'public' | 'paywall' | 'subscribers'
  description: string
  error: string | null
  loadingStatus: string | null
  selectedContentID: string | null
  selectedView: 'preview' | 'media'
}

const DEFAULT_STATE: State = {
  isCreating: false,
  shareMode: 'public',
  description: '',
  error: null,
  loadingStatus: null,
  selectedContentID: null,
  selectedView: 'preview',
}

class CreatePostDark extends React.Component<Props, State> {
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

  onChangeText = (e: string) => this.setState({ description: e })

  onChangeShareMode = (item: { value: any }) => {
    this.setState({
      shareMode: item.value,
    })
  }

  onPressCreate = async () => {
    this.setState({
      isCreating: true,
      loadingStatus: 'sending...',
    })

    try {
      //mediaContent=
      const { medias } = this.props.mediaLib
      const { selectedContentID } = this.state
      if (!selectedContentID) {
        return
      }
      const mediaContent = medias[selectedContentID]
      const { description } = this.state
      const dataToSendToService = {
        paragraphs: description.split('\n'),
        //images: images.map(image => image.data),
      }
      /**
       * @type {(Schema.EmbeddedVideo|Schema.EmbeddedImage|Schema.Paragraph)[]}
       */
      const contentItems = [
        ...dataToSendToService.paragraphs.map(p => {
          /**
           * @type {Schema.Paragraph} paragraph
           */
          const paragraph = {
            type: 'text/paragraph',
            text: p,
          }
          return paragraph
        }),
      ]
      if (mediaContent) {
        mediaContent.forEach(e => {
          //@ts-ignore
          contentItems.push(e)
        })
      }
      // eslint-disable-next-line no-console
      console.log('onPressCreate dataToSendToService', dataToSendToService)
      const res = await Http.post(`/api/gun/wall`, {
        tags: [],
        title: 'Post',
        contentItems,
      })
      if (res.status !== 200) {
        throw new Error(`Status not OK`)
      } else {
        this.props.navigation.goBack()
      }
    } catch (e) {
      const msg = `Error: ${e.message ||
        e.data.errorMessage ||
        e.response.data.errorMessage ||
        'Unknown error'}`
      ToastAndroid.show(msg, 800)
      Logger.log(msg)
    } finally {
      this.setState({
        isCreating: false,
        loadingStatus: null,
      })
    }
  }

  selectMedia = (contentID: string) => () => {
    this.setState({ selectedContentID: contentID })
  }

  prepareMediaItems = (): [() => void, CompleteAnyMedia[]][] => {
    const { medias } = this.props.mediaLib
    const { shareMode } = this.state
    const mediaReady: [() => void, CompleteAnyMedia[]][] = []
    for (let contentID in medias) {
      const media: CompleteAnyMedia[] = medias[contentID]
      const mainMedia = media[0].isPreview ? media[1] : media[0]
      if (shareMode === 'public') {
        if (!mainMedia.isPrivate) {
          mediaReady.push([this.selectMedia(contentID), media])
        }
      }
      if (shareMode === 'paywall' || shareMode === 'subscribers') {
        if (mainMedia.isPrivate) {
          mediaReady.push([this.selectMedia(contentID), media])
        }
      }
    }
    return mediaReady.reverse()
  }

  renderPostItem({ item }: { item: [() => void, CompleteAnyMedia[]] }) {
    //const localSelect = this.selectMedia.bind(this)
    const [selectThis, content] = item

    const previewMedia: CompleteAnyMedia | undefined = content.find(
      e => e.isPreview,
    )
    const mainMedia: CompleteAnyMedia | undefined = content.find(
      e => !e.isPreview,
    )
    if (!mainMedia) {
      return (
        <View style={{ marginRight: 20 }}>
          <Text>Media not found</Text>
        </View>
      )
    }
    const ref: CompleteAnyMedia = previewMedia ? previewMedia : mainMedia
    const permission = mainMedia.isPrivate ? 'private' : 'public'
    return (
      <View style={{ marginRight: 20 }}>
        <View
          style={{
            height: 100,
            aspectRatio: Number(ref.width) / Number(ref.height),
          }}
        >
          {ref.type === 'image/embedded' && (
            <ShockWebView
              type="image"
              width={Number(ref.width)}
              height={Number(ref.height)}
              magnet={ref.magnetURI}
              permission={permission}
              selectedView={'preview'}
              updateToMedia={null}
            />
          )}
          {ref.type === 'video/embedded' && (
            <ShockWebView
              type="video"
              width={Number(ref.width)}
              height={Number(ref.height)}
              magnet={ref.magnetURI}
              permission={permission}
              selectedView={'preview'}
              updateToMedia={null}
            />
          )}
        </View>
        <FontAwesome name="plus" size={20} color="white" onPress={selectThis} />
        {/*<ImageBackground
          source={item.image}
          resizeMode="cover"
          style={styles.postImageBackground}
        >
          {item.offer && (
            <View style={styles.offerPost}>
              <FontAwesome name="check-circle" size={36} color="white" />
            </View>
          )}
        </ImageBackground>*/}
      </View>
    )
  }

  togglePublicMedia = () => {
    if (this.state.selectedView === 'preview') {
      this.setState({ selectedView: 'media' })
    }
  }

  render() {
    const { error, loadingStatus, selectedContentID, selectedView } = this.state
    const { medias } = this.props.mediaLib
    let preview = null
    let media = null
    let availableDropdownItems = [
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
    ]
    if (selectedContentID) {
      //notificationService.Log("TESTING",JSON.stringify(medias[selectedContentID]))
      if (medias[selectedContentID][0].isPreview) {
        ;[preview, media] = medias[selectedContentID]
      } else {
        ;[media] = medias[selectedContentID]
      }
      if (media.isPrivate) {
        availableDropdownItems = [
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
        ]
      } else {
        availableDropdownItems = [
          {
            label: 'Public',
            value: 'public',
            icon: () => <PublicIcon />,
          },
        ]
      }
    }
    let mediaToShow: CompleteAnyMedia | null = media
    if (media && !media.isPrivate) {
      if (selectedView === 'preview') {
        mediaToShow = preview
      } else {
        mediaToShow = media
      }
    }

    return (
      <ScrollView style={styles.mainContainer}>
        <Pad amount={50} />
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
              //labelStyle={styles.labelDark}
              style={styles.descContainer}
              onChange={this.onChangeText}
              placeholder="Order our famouse souce and dry rubs"
            />
            <View style={styles.dropdownContainerView}>
              <DropDownPicker
                items={availableDropdownItems}
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
              {/*<TouchableOpacity style={styles.contentType1}>
                <Icon name="check" color="white" size={15} />
                <Text style={styles.contentTypeText1}>Offers</Text>
              </TouchableOpacity>*/}
              <TouchableOpacity style={styles.contentType2}>
                <Text style={styles.contentTypeText2}>Content</Text>
              </TouchableOpacity>
            </View>
            {selectedContentID && (
              <View>
                <Text style={{ color: 'white' }}>Content</Text>
                {preview && media && media.isPrivate && (
                  <View
                    style={{
                      width: '100%',
                      aspectRatio:
                        Number(preview.width) / Number(preview.height),
                    }}
                  >
                    <Text style={{ color: 'white' }}>Selected Preview</Text>
                    <ShockWebView
                      magnet={preview.magnetURI}
                      width={Number(preview.width)}
                      height={Number(preview.height)}
                      type={
                        preview.type === 'image/embedded' ? 'image' : 'video'
                      }
                      permission={'private'}
                      selectedView={'preview'}
                      updateToMedia={null}
                    />
                  </View>
                )}
                {mediaToShow && (
                  <View
                    style={{
                      width: '100%',
                      aspectRatio:
                        Number(mediaToShow.width) / Number(mediaToShow.height),
                    }}
                  >
                    <Text style={{ color: 'white' }}>Selected Media</Text>
                    <ShockWebView
                      magnet={mediaToShow.magnetURI}
                      width={Number(mediaToShow.width)}
                      height={Number(mediaToShow.height)}
                      type={
                        mediaToShow.type === 'image/embedded'
                          ? 'image'
                          : 'video'
                      }
                      permission={
                        media && media.isPrivate ? 'private' : 'public'
                      }
                      selectedView={selectedView}
                      updateToMedia={this.togglePublicMedia}
                    />
                  </View>
                )}
              </View>
            )}
            {!selectedContentID && (
              <View style={styles.postsCarousel}>
                <FlatList
                  data={this.prepareMediaItems()}
                  renderItem={this.renderPostItem}
                  horizontal
                />
              </View>
            )}

            <Pad amount={10} />
            {this.state.isCreating ? (
              <View>
                <ActivityIndicator />
                {loadingStatus && <Text>Status: {loadingStatus}</Text>}
                {error && <Text>Error: {error}</Text>}
              </View>
            ) : (
              <View style={styles.actionButtonsDark}>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark1}
                  onPress={this.goBack}
                >
                  <Text style={styles.actionButtonTextDark1}>Cancel</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark2}
                  onPress={this.onPressCreate}
                >
                  <Text style={styles.actionButtonTextDark2}>Save</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    )
  }
}

const mapStateToProps = ({ mediaLib }: import('../../reducers').State) => ({
  mediaLib,
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreatePostDark)

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'rgba(22, 25, 28, .94)',
    //paddingVertical: 50,
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
  /*labelDark: {
    fontSize: 15,
    color: '#BBBBBB',
    fontFamily: 'Montserrat-600',
    marginBottom: 11,
    paddingLeft: 7,
  },*/
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
