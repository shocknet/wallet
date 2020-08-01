import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
// @ts-ignore
import { Dropdown } from 'react-native-material-dropdown'
import * as CSS from '../../../res/css'
import InputGroup from '../../../components/InputGroup'
import {
  setAmount,
  setDescription,
  setUnitSelected,
} from '../../../actions/InvoiceActions'

/**
 * @typedef {ReturnType<typeof mapStateToProps>} ConnectedRedux
 */
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */

/**
 * @typedef {object} TmpProps
 * @prop {Navigation} navigation
 * @prop {(amount:string)=>void} setAmount
 * @prop {(description:string)=>void} setDescription
 * @prop {(unit:import('../../../actions/InvoiceActions').SelectedUnit)=>void} setUnitSelected
 */
/**
 * @typedef {ConnectedRedux & TmpProps} Props
 */

/**
 * @type {React.FC<Props>}
 */
const AmountStep = ({
  setAmount,
  setDescription,
  setUnitSelected,
  invoice,
}) => ((
  <>
    <Text style={styles.stepTitle}>Enter Amount</Text>
    <View>
      <View style={styles.amountContainer}>
        <InputGroup
          label="Amount"
          value={invoice.amount}
          onChange={setAmount}
          style={styles.amountInput}
          type="numeric"
        />
        <Dropdown
          data={[
            {
              value: 'sats',
            },
            {
              value: 'BTC',
            },
          ]}
          onChangeText={setUnitSelected}
          containerStyle={styles.amountSelect}
          value={invoice.unitSelected ? 'sats' : invoice.unitSelected}
          lineWidth={0}
          inputContainerStyle={styles.amountSelectInput}
          rippleOpacity={0}
          pickerStyle={styles.amountPicker}
          dropdownOffset={{ top: 8, left: 0 }}
          rippleInsets={{ top: 8, bottom: 0, right: 0, left: 0 }}
        />
      </View>
      <View>
        <InputGroup
          label="Description"
          value={invoice.description}
          onChange={setDescription}
          inputStyle={styles.descInput}
          multiline
        />
      </View>
    </View>
  </>
))

/**
 * @param {{
 * invoice:import('../../../../reducers/InvoiceReducer').State}} state
 */
const mapStateToProps = ({ invoice }) => ({ invoice })

const mapDispatchToProps = {
  setAmount,
  setDescription,
  setUnitSelected,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AmountStep)

const styles = StyleSheet.create({
  stepTitle: {
    fontFamily: 'Montserrat-700',
    textAlign: 'center',
    fontSize: 22,
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  amountInput: {
    width: '60%',
    marginBottom: 0,
  },
  amountSelect: {
    width: '35%',
    marginBottom: 0,
    height: 45,
  },
  amountSelectInput: {
    borderBottomColor: CSS.Colors.TRANSPARENT,
    elevation: 4,
    paddingHorizontal: 15,
    borderRadius: 100,
    height: 45,
    alignItems: 'center',
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
  },
  amountPicker: { borderRadius: 15 },
  descInput: { height: 100, borderRadius: 15, textAlignVertical: 'top' },
})
