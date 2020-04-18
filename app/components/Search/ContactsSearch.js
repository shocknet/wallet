/**
 * @format
 */
import React, { PureComponent } from 'react'
import {
  // Clipboard,
  StyleSheet,
  View,
  TextInput,
  FlatList,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import Logger from 'react-native-file-log'
import Suggestion from './Suggestion'
import { selectContact } from '../../actions/ChatActions'
import { decodePaymentRequest } from '../../actions/InvoiceActions'

import * as CSS from '../../res/css'

/**
 * @typedef {import('../../actions/ChatActions').SelectedContact} ContactTypes
 */

/**
 * @typedef {'btc'|'invoice'|'contacts'} EnabledFeatures
 */

/**
 * @typedef {({ type: 'error', error: Error }|undefined)} DecodeResponse
 */

/**
 * @typedef {object} Props
 * @prop {string} value
 * @prop {(text: string) => void} onChange
 * @prop {((error: string|undefined) => void)=} onError
 * @prop {(object)=} style
 * @prop {(object)=} inputStyle
 * @prop {(string)=} icon
 * @prop {(boolean)=} disabled
 * @prop {(boolean)=} multiline
 * @prop {(EnabledFeatures[])=} enabledFeatures
 * @prop {(string)=} placeholder
 * @prop {(contact: ContactTypes) => void} selectContact
 * @prop {(paymentRequest: string) => DecodeResponse} decodePaymentRequest
 * @prop {{ contacts: import('../../actions/ChatActions').Contact[] }} chat
 */

/**
 * @augments PureComponent<Props, {}, never>
 */
class ContactsSearch extends PureComponent {
  // state = {
  //   focused: false,
  // }

  // setFocus = (focused = false) => () => {
  //   this.setState({
  //     focused,
  //   })
  // }

  defaultFeatures = ['btc', 'invoice', 'contacts']

  /**
   * @param {import('../../actions/ChatActions').SelectedContact} item
   * @param {number} index
   * @returns {string}
   */
  contactKeyExtractor = (item, index) => {
    if ('pk' in item) {
      return item.pk
    }

    if ('address' in item) {
      return item.address
    }

    if ('paymentRequest' in item) {
      return item.paymentRequest
    }

    return index.toString()
  }

  decodeInvoice = () => {
    const { decodePaymentRequest, value, onError } = this.props
    try {
      const data = decodePaymentRequest(value)
      Logger.log(data)
      if (data && data.type === 'error') {
        if (onError) {
          onError(data.error.message)
        }
      }
    } catch (err) {
      Logger.log('Decode Invoice Error:', err)
      if (onError) {
        onError(err)
      }
    }
  }

  /** @type {import('react-native').ListRenderItem<any>} */
  contactRender = contact => {
    Logger.log('Contact:', contact)
    if (contact.item.type === 'btc') {
      return ((
        <Suggestion
          name={contact.item.address}
          type="btc"
          onPress={this.setBTCAddress}
        />
      ))
    }

    if (contact.item.type === 'invoice') {
      return ((
        <Suggestion
          name={contact.item.paymentRequest}
          type="invoice"
          onPress={this.decodeInvoice}
        />
      ))
    }

    return ((
      <Suggestion
        name={contact.item.displayName}
        avatar={{ uri: contact.item.avatar }}
        type="contact"
        onPress={this.selectContact({ ...contact.item, type: 'contact' })}
      />
    ))
  }

  isBTCAddress = () => {
    const { value } = this.props

    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(value)
  }

  isLightningInvoice = () => {
    const { value } = this.props
    return /^(ln(tb|bc))[0-9][a-z0-9]{180,7089}$/.test(value.toLowerCase())
  }

  setBTCAddress = () => {
    const { selectContact, value } = this.props
    selectContact({ address: value, type: 'btc' })
  }

  /**
   * @param {ContactTypes} contact
   */
  selectContact = contact => () => {
    const { selectContact } = this.props
    selectContact({ ...contact, type: 'contact' })
  }

  filterContacts = () => {
    const { value, chat } = this.props
    const { contacts } = chat
    return contacts.filter(contact =>
      contact.displayName.toLowerCase().includes(value.toLowerCase()),
    )
  }

  /**
   * @returns {ContactTypes[]}
   */
  getContacts = () => {
    const { value, enabledFeatures = this.defaultFeatures } = this.props
    Logger.log('Enabled Features:', enabledFeatures)
    const filteredContacts = enabledFeatures.includes('contacts')
      ? this.filterContacts()
      : []

    if (enabledFeatures.includes('btc') && this.isBTCAddress()) {
      return [{ address: value, type: 'btc' }, ...filteredContacts]
    }

    if (enabledFeatures.includes('invoice') && this.isLightningInvoice()) {
      return [{ paymentRequest: value, type: 'invoice' }, ...filteredContacts]
    }

    return filteredContacts
  }

  render() {
    const {
      placeholder = 'Search Contacts...',
      value,
      onChange,
      style,
      inputStyle,
      disabled,
    } = this.props
    return (
      <View
        style={[
          styles.inputGroupContainer,
          style,
          disabled ? styles.disabledContainer : null,
        ]}
      >
        <View style={styles.inputGroup}>
          <View
            style={[
              styles.inputContainer,
              inputStyle,
              disabled ? styles.disabledInput : null,
            ]}
          >
            <Ionicons name="md-search" color="#CBC5C5" size={16} />
            <TextInput
              style={styles.input}
              value={value}
              editable={!disabled}
              onChangeText={onChange}
              placeholder={placeholder}
              // onFocus={this.setFocus(true)}
              // onBlur={value.length === 0 ? this.setFocus(false) : undefined}
            />
          </View>
          {value.length > 0 ? (
            <FlatList
              data={this.getContacts()}
              renderItem={this.contactRender}
              style={styles.inputSuggestions}
              keyExtractor={this.contactKeyExtractor}
            />
          ) : null}
        </View>
      </View>
    )
  }
}

/** @param {import('../../../reducers/index').default} state */
const mapStateToProps = ({ chat }) => ({ chat })

const mapDispatchToProps = {
  selectContact,
  decodePaymentRequest,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  // @ts-ignore
)(ContactsSearch)

const styles = StyleSheet.create({
  inputGroupContainer: {
    width: '100%',
    elevation: 5,
  },
  inputGroup: {
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 13,
    borderRadius: 100,
    height: 45,
    marginBottom: 10,
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    overflow: 'hidden',
  },
  disabledInput: {
    elevation: 0,
  },
  input: {
    flex: 1,
    marginLeft: 5,
  },
  inputSuggestions: {
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    width: '100%',
    height: 150,
    borderRadius: 15,
  },
})
