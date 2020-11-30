import React from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native'
import Modal from 'react-native-modal'
import * as Common from 'shock-common'
import DropDownPicker from 'react-native-dropdown-picker'

import * as CSS from '../../res/css'
import Pad from '../../components/Pad'
import InputGroup from '../../components/InputGroup'
import ArrowLeft from '../../assets/images/arrow-left.svg'
import * as Services from '../../services'

interface MetaConfigModalState {
  webClientPrefix: Common.WebClientPrefix | null
  webTorrentSeed: string | null
}

export default class MetaConfigModal extends React.PureComponent<
  any,
  MetaConfigModalState
> {
  mounted = true

  state: MetaConfigModalState = {
    webClientPrefix: null,
    webTorrentSeed: null,
  }

  setupWebClientPrefix = async () => {
    try {
      const { data: webClientPrefix } = await Services.get<{ data: unknown }>(
        'api/gun/user/once/Profile>webClientPrefix',
      )
      if (!this.mounted) {
        return
      }

      if (typeof webClientPrefix === 'string') {
        this.setState({
          webClientPrefix: webClientPrefix as Common.WebClientPrefix,
        })
      } else {
        await Services.post(`api/gun/put`, {
          path: '$user>Profile>webClientPrefix',
          value: availableDropdownItems[0].value,
        })

        if (!this.mounted) {
          return
        }

        this.setState({
          webClientPrefix: availableDropdownItems[0].value,
        })
      }
    } catch (e) {
      ToastAndroid.show(
        `Could not fetch web client prefix:${e.message}, will retry...`,
        ToastAndroid.LONG,
      )

      setTimeout(() => {
        if (this.mounted) {
          this.setupWebClientPrefix()
        }
      }, 4000)
    }
  }

  setupWebTorrentSeed = async () => {
    try {
      const { data: webTorrentSeed } = await Services.get<{ data: unknown }>(
        'api/gun/user/once/webTorrentSeed',
      )
      if (!this.mounted) {
        return
      }

      if (typeof webTorrentSeed === 'string') {
        this.setState({
          webTorrentSeed: webTorrentSeed,
        })
      } else {
        await Services.post(`api/gun/put`, {
          path: '$user>webTorrentSeed',
          value: 'https://webtorrent.shock.network',
        })

        if (!this.mounted) {
          return
        }

        this.setState({
          webTorrentSeed: 'https://webtorrent.shock.network',
        })
      }
    } catch (e) {
      ToastAndroid.show(
        `Could not fetch web torrent seed:${e.message}, will retry...`,
        ToastAndroid.LONG,
      )

      setTimeout(() => {
        if (this.mounted) {
          this.setupWebTorrentSeed()
        }
      }, 4000)
    }
  }

  async componentDidMount() {
    this.mounted = true

    this.setupWebClientPrefix()
    this.setupWebTorrentSeed()
  }

  componentWillUnmount() {
    this.mounted = false
  }

  onChangeWebClientPrefix: React.ComponentProps<
    typeof import('react-native-dropdown-picker').default
  >['onChangeItem'] = ({ value: prefix }) => {
    this.setState({
      webClientPrefix: prefix,
    })
  }

  onChangeWebTorrentSeed = (webTorrentSeed: string) => {
    this.setState({
      webTorrentSeed,
    })
  }

  onSave = () => {
    const { webClientPrefix, webTorrentSeed } = this.state
    const { toggleModal } = this.props

    Services.post(`api/gun/put`, {
      path: '$user>Profile>webClientPrefix',
      value: webClientPrefix,
    }).catch(e => {
      ToastAndroid.show(
        `Could not save web client prefix -> ${e.message}`,
        ToastAndroid.LONG,
      )
    })

    Services.post(`api/gun/put`, {
      path: '$user>webTorrentSeed',
      value: webTorrentSeed,
    }).catch(e => {
      ToastAndroid.show(
        `Could not save web torrent seed URL -> ${e.message}`,
        ToastAndroid.LONG,
      )
    })

    toggleModal()
  }

  render() {
    const { props } = this
    const { webClientPrefix, webTorrentSeed } = this.state

    return (
      <>
        <StatusBar
          translucent
          backgroundColor="rgba(22, 25, 28, .94)"
          barStyle="light-content"
        />

        <View style={CSS.styles.flex}>
          <Modal
            isVisible={props.isModalVisible}
            backdropColor="#16191C"
            backdropOpacity={0.94}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={600}
            animationOutTiming={600}
            backdropTransitionInTiming={600}
            backdropTransitionOutTiming={600}
            onBackdropPress={props.toggleModal}
          >
            <View style={styles.container}>
              <View>
                <View style={styles.backButton}>
                  <TouchableOpacity onPress={props.toggleModal}>
                    <ArrowLeft size={19} />
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.caption}>Brand Config</Text>
                </View>
                <Pad amount={40} />

                {webClientPrefix === null ? (
                  <ActivityIndicator
                    color={CSS.Colors.DARK_MODE_CYAN}
                    size="small"
                  />
                ) : (
                  <View
                    style={
                      webClientPrefix === null
                        ? styles.webClientPrefixPickerDisabled
                        : styles.webClientPrefixPicker
                    }
                  >
                    <DropDownPicker
                      items={availableDropdownItems}
                      defaultValue={webClientPrefix}
                      containerStyle={styles.dropdownContainer}
                      style={styles.dropdown}
                      itemStyle={styles.dropdownItem}
                      dropDownStyle={styles.dropdownDropdown}
                      onChangeItem={this.onChangeWebClientPrefix}
                      labelStyle={styles.dropdownLabel}
                      arrowColor="#B2B2B2"
                    />

                    <Pad amount={12} insideRow />

                    <Text style={styles.slash}>/</Text>

                    <Pad amount={12} insideRow />

                    <Text
                      style={styles.publicKey}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                    >
                      {this.props.publicKey}
                    </Text>
                  </View>
                )}

                <Pad amount={40} />

                <InputGroup
                  label="Webtorrent Seed"
                  value={webTorrentSeed ?? ''}
                  placeholder={webTorrentSeed === null ? 'Loading...' : ''}
                  disabled={webTorrentSeed === null}
                  onChange={this.onChangeWebTorrentSeed}
                />
              </View>

              <View style={CSS.styles.rowCenteredSpaceBetween}>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={props.toggleModal}
                  style={styles.actionButtonDark1}
                >
                  <Text style={styles.actionButtonTextDark1}>Cancel</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={this.onSave}
                  style={styles.actionButtonDark2}
                >
                  <Text style={styles.actionButtonTextDark2}>Save</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>
      </>
    )
  }
}

const availableDropdownItems: Array<{
  label: string
  value: Common.WebClientPrefix
}> = [
  {
    label: 'https://shock.pub',
    value: 'https://shock.pub',
  },
  {
    label: 'https://lightning.page',
    value: 'https://lightning.page',
  },
  {
    label: 'https://satoshi.watch',
    value: 'https://satoshi.watch',
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
  touchableButton: {
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    color: '#BBB8B8',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: '100%',
  },
  touchableOpacity: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 15,
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
  webClientPrefixPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  webClientPrefixPickerDisabled: {},
  slash: {
    fontFamily: 'Montserrat-Regular',
    color: CSS.Colors.DARK_MODE_CYAN,
  },
  publicKey: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: CSS.Colors.DARK_MODE_TEXT_GRAY,
    flexShrink: 2,
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
})
