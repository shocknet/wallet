import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableHighlight,
  Image,
  PixelRatio,
  Dimensions,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
} from 'react-native'

import { connect } from 'react-redux'
import { FilePickerFile } from 'react-native-file-picker'
import Video from 'react-native-video'
import ImagePicker from 'react-native-image-crop-picker'

import * as CSS from '../res/css'
import Pad from '../components/Pad'
import InputGroup from '../components/InputGroup'
import ArrowLeft from '../assets/images/arrow-left.svg'
import ContentImages from '../assets/images/publish-content/images.svg'
import ContentVideo from '../assets/images/publish-content/video.svg'
import ContentMusic from '../assets/images/publish-content/music.svg'
import ContentFile from '../assets/images/publish-content/file.svg'
import { pickFile } from '../services/seedServer'
import * as Thunks from '../store/thunks'
import { MediaToUpload, ThumbnailFile } from '../store/thunks/mediaLib'
import { clearContentUpload } from '../store/actions/mediaLib'

type FileReady = FilePickerFile & { name: string }
type Props = {
  navigation: import('react-navigation').NavigationScreenProp<{}, {}>
  mediaLib: import('../store/reducers/mediaLib').State
  publishMedia: (media: MediaToUpload, thumbnail?: ThumbnailFile) => void
  clearContentUpload: () => void
}

type selectedFileInfo = {
  file: FileReady | null
  isImage: boolean
  isVideo: boolean
  height: number
  width: number
}

type State = {
  title: string
  description: string
  isPostOrTeaser: boolean
  isPrivate: boolean

  selectedMedia: selectedFileInfo
  selectedPreview: selectedFileInfo

  processing: boolean
  error: string | null

  previewImageWidth: number
  previewVideoWidth: number
  mainImageWidth: number
  mainVideoWidth: number

  thumbnailFile?: ThumbnailFile

  selectedVideoPaused: boolean
}

const emptySelectedMedia = (): selectedFileInfo => ({
  file: null,
  isImage: false,
  isVideo: false,
  height: 0,
  width: 0,
})

const DEFAULT_STATE: State = {
  title: '',
  description: '',
  isPostOrTeaser: false,
  isPrivate: false,
  selectedMedia: emptySelectedMedia(),
  selectedPreview: emptySelectedMedia(),
  processing: false,
  error: null,
  mainImageWidth: 0,
  mainVideoWidth: 0,
  previewImageWidth: 0,
  previewVideoWidth: 0,
  selectedVideoPaused: false,
}

const getMediaStyle = ({
  w,
  h,
  parentW = Dimensions.get('window').width,
}: {
  w: number
  h: number
  parentW: number | undefined
}) => {
  if (!parentW) {
    parentW = Dimensions.get('window').width
  }
  const screenR = PixelRatio.get()
  const rW = PixelRatio.roundToNearestPixel(w / screenR)
  const rH = PixelRatio.roundToNearestPixel(h / screenR)
  const factor = rW > parentW ? 1 : rW / parentW

  const s = StyleSheet.create({
    video: {
      width: rW > parentW ? '100%' : rW,
      height: (rH / rW) * parentW * factor,
    },
  })
  return s.video
}

class PublishContentDark extends React.PureComponent<Props, State> {
  static navigationOptions: import('react-navigation-stack').NavigationStackOptions = {
    header: () => null,
  }

  state = DEFAULT_STATE

  mediaVideoPlayer: any = null

  updateMediaContainerWidth = (key: string) => (e: LayoutChangeEvent) => {
    switch (key) {
      case 'mainImageWidth':
        this.setState({ [key]: e.nativeEvent.layout.width })
        break
      case 'mainVideoWidth':
        this.setState({ [key]: e.nativeEvent.layout.width })
        break
      case 'previewImageWidth':
        this.setState({ [key]: e.nativeEvent.layout.width })
        break
      case 'previewVideoWidth':
        this.setState({ [key]: e.nativeEvent.layout.width })
        break
      default:
        break
    }
  }

  assignVideoRef = (type: 'main' | 'preview') => (ref: any) => {
    if (type === 'main') {
      this.mediaVideoPlayer = ref
    }
  }

  onPressPostOrTeaser = () => {
    if (this.state.isPostOrTeaser) {
      this.setState({ isPostOrTeaser: false })
    } else {
      this.setState({ isPostOrTeaser: true })
    }
  }
  onPressPrivateContent = () => {
    if (this.state.isPrivate) {
      this.setState({ isPrivate: false })
    } else {
      this.setState({ isPrivate: true })
    }
  }

  onVideoLoad = (type: 'main' | 'preview') => (e: {
    naturalSize: { height: number; width: number }
  }) => {
    if (type === 'main') {
      this.setState({
        selectedMedia: {
          ...this.state.selectedMedia,
          height: e.naturalSize.height,
          width: e.naturalSize.width,
        },
      })
    }
  }

  onChangeTitle = (text: string) => {
    this.setState({
      title: text,
    })
  }

  onChangeDescription = (text: string) => {
    this.setState({
      description: text,
    })
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  onPressPicker = async (
    prefix: 'image' | 'video' | 'audio' | 'file',
    preview: boolean,
  ) => {
    try {
      if (prefix === 'audio') {
        throw new Error('Audio files are not supported yet')
      }
      if (prefix === 'file') {
        throw new Error('General files are not supported yet')
      }
      const fileType = prefix === 'image' ? 'photo' : 'video'
      const file = await pickFile(fileType)

      if (!file.type.startsWith(prefix + '/')) {
        throw new Error('Invalid file type selected please select a ' + prefix)
      }
      file.name = file.fileName
      if (file.type.startsWith('image/')) {
        const size = {
          w: file.width,
          h: file.height,
        }
        if (preview) {
          this.setState({
            selectedPreview: {
              file: file,
              isImage: true,
              height: size.h,
              width: size.w,
              isVideo: false,
            },
          })
        } else {
          const croppedImg: {
            width: number
            height: number
            size: number
            mime: string
            path: string
          } = await ImagePicker.openCropper({
            path: file.path,
            compressImageMaxHeight: 200,
            compressImageMaxWidth: (size.w / size.h) * 200,
            cropperToolbarTitle: 'Thumbnail',
          })
          this.setState({
            selectedMedia: {
              file: file,
              isImage: true,
              height: size.h,
              width: size.w,
              isVideo: false,
            },
            thumbnailFile: {
              height: croppedImg.height,
              width: croppedImg.width,
              path: croppedImg.path,
              type: croppedImg.mime,
            },
          })
        }
      } else if (file.type.startsWith('video/')) {
        if (preview) {
          this.setState({
            selectedPreview: {
              file: file,
              isVideo: true,
              height: 0, //still unknown
              width: 0, //still unknown
              isImage: false,
            },
          })
        } else {
          //should be unreachable, not supported yet
          this.setState({
            selectedMedia: {
              file: file,
              isVideo: true,
              height: 0, //still unknown
              width: 0, //still unknown
              isImage: false,
            },
          })
        }
      } else {
        this.setState({ error: 'unknown file type selected' })
      }
    } catch (e) {
      this.setState({ error: e })
    }
  }
  onDiscard = () => {
    this.setState(DEFAULT_STATE)
    this.props.clearContentUpload()
  }
  onPublish = () => {
    const {
      selectedPreview,
      selectedMedia,
      description,
      title,
      isPrivate,
      thumbnailFile,
    } = this.state
    const { mediaLib } = this.props
    if (!selectedMedia.file) {
      //err
      return
    }
    const media: MediaToUpload = {
      seedServerUrl: mediaLib.seedServerUrl,
      seedServerToken: mediaLib.seedServerToken,
      privateContent: isPrivate,
      previewMedia: selectedPreview.file ? selectedPreview.file : null,
      previewMediaHeight: selectedPreview.file ? selectedPreview.height : 0,
      previewMediaWidth: selectedPreview.file ? selectedPreview.width : 0,
      mainMedia: selectedMedia.file,
      mainMediaHeight: selectedMedia.height,
      mainMediaWidth: selectedMedia.width,
      description,
      title,
    }
    this.props.publishMedia(media, thumbnailFile)
    this.setState({
      processing: true,
    })
  }
  componentDidUpdate(prevProps: Props) {
    const { mediaLib: oldMediaLib } = prevProps
    const { mediaLib } = this.props
    if (mediaLib.status !== oldMediaLib.status && mediaLib.status === '') {
      this.setState({
        title: '',
        description: '',
        isPostOrTeaser: false,
        isPrivate: false,
        selectedMedia: emptySelectedMedia(),
        selectedPreview: emptySelectedMedia(),
        processing: false,
        error: null,
        mainImageWidth: 0,
        mainVideoWidth: 0,
        previewImageWidth: 0,
        previewVideoWidth: 0,
        thumbnailFile: undefined,
        selectedVideoPaused: false,
      })
      this.goBack()
    }
    /*if(mediaLib.error !== oldMediaLib.error && mediaLib.error !== null){
      this.setState({
        processing:true
      })
    }*/
  }

  onPressHeroImage = () => {
    this.onPressPicker('image', true)
  }
  onPressImageContent = () => {
    this.onPressPicker('image', false)
  }
  onPressVideoContent = () => {
    this.onPressPicker('video', false)
  }
  onPressMusicContent = () => {
    this.onPressPicker('audio', false)
  }
  onPressFileContent = () => {
    this.onPressPicker('file', false)
  }
  toggleVideoPaused = () => {
    this.setState({ selectedVideoPaused: !this.state.selectedVideoPaused })
  }

  render() {
    const {
      title,
      description,
      //selectedPreview,
      selectedMedia,
      processing,
      isPrivate,
      //isPostOrTeaser,
      //previewImageWidth,
      mainImageWidth,
      mainVideoWidth,
    } = this.state
    const { mediaLib } = this.props
    /*const previewSource = {
      uri:
        selectedPreview.file && selectedPreview.file.uri
          ? selectedPreview.file.uri
          : '',
    }*/
    const mediaSource = {
      uri:
        selectedMedia.file && selectedMedia.file.uri
          ? selectedMedia.file.uri
          : '',
    }
    const { width, height } = Dimensions.get('window')
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
              value={title}
              onChange={this.onChangeTitle}
              style={styles.inputGroup}
              labelStyle={styles.labelDark}
              placeholder="How I monetized my content with ShockWallet"
            />
            <View style={styles.contentsContainer}>
              <Text style={styles.labelDark}>Contents</Text>
              <View style={styles.contentIcons}>
                <View style={styles.contentIcon}>
                  <ContentImages onPress={this.onPressImageContent} />
                </View>
                <View style={styles.contentIcon}>
                  <ContentVideo onPress={this.onPressVideoContent} />
                </View>
                <View style={styles.contentIcon}>
                  <ContentMusic onPress={this.onPressMusicContent} />
                </View>
                <View style={styles.contentIcon}>
                  <ContentFile onPress={this.onPressFileContent} />
                </View>
              </View>
            </View>
            {selectedMedia.isImage && (
              <View
                onLayout={this.updateMediaContainerWidth('mainImageWidth')}
                style={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <Image
                  style={getMediaStyle({
                    w: selectedMedia.width,
                    h: selectedMedia.height,
                    parentW: mainImageWidth,
                  })}
                  source={mediaSource}
                />
              </View>
            )}
            {selectedMedia.isVideo && (
              <View
                onLayout={this.updateMediaContainerWidth('mainVideoWidth')}
                style={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <TouchableWithoutFeedback onPress={this.toggleVideoPaused}>
                  <Video
                    ref={this.assignVideoRef('main')}
                    style={getMediaStyle({
                      w: selectedMedia.width,
                      h: selectedMedia.height,
                      parentW: mainVideoWidth,
                    })}
                    controls={false}
                    paused={this.state.selectedVideoPaused}
                    onLoad={this.onVideoLoad('main')}
                    source={mediaSource}
                  />
                </TouchableWithoutFeedback>
              </View>
            )}
            <InputGroup
              label="Description"
              multiline
              value={description}
              onChange={this.onChangeDescription}
              inputStyle={styles.descInputDark}
              labelStyle={styles.labelDark}
              style={styles.descContainer}
              placeholder="I made a quick video to show you guys how easy it is to run your own social platform on ShockWallet, and start earning Bitcoin"
            />
            {isPrivate && (
              <Text style={{ color: 'red' }}>
                This content can be made available only to subscribers or via a
                paywall
              </Text>
            )}

            {!processing && (
              <View style={styles.actionButtonsDark}>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark1}
                  onPress={this.onDiscard}
                >
                  <Text style={styles.actionButtonTextDark1}>Discard</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark2}
                  onPress={this.onPublish}
                >
                  <Text style={styles.actionButtonTextDark2}>Publish</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        </ScrollView>
        {processing ? (
          <View
            style={[
              styles.sendingOverlay,
              {
                width: width,
                height: height,
              },
            ]}
          >
            <ActivityIndicator color={CSS.Colors.FUN_BLUE} size="large" />
            <Text style={styles.sendingText}>
              Processing: {mediaLib.status}
            </Text>
            <Text style={styles.sendingText}>{mediaLib.error}</Text>
          </View>
        ) : null}
      </View>
    )
  }
}

const mapStateToProps = ({ mediaLib }: import('../store/reducers').State) => ({
  mediaLib,
})

const mapDispatchToProps = (dispatch: any) => ({
  publishMedia: (media: MediaToUpload, thumbnail?: ThumbnailFile) => {
    dispatch(Thunks.uploadMedia(media, thumbnail))
  },
  clearContentUpload: () => {
    dispatch(clearContentUpload())
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PublishContentDark)

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
  sendingOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22,25,28,0.95)',
    elevation: 10,
    zIndex: 1000,
  },
  sendingText: {
    color: CSS.Colors.TEXT_GRAY,
    fontSize: 14,
    fontFamily: 'Montserrat-700',
    marginTop: 10,
  },
})
