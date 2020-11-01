import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import range from 'lodash/range'

import Pad from '../../components/Pad'
import * as CSS from '../../res/css'
import ShockBackground from '../ShockBackground'

import PageBtn from './PageBtn'

/**
 * @typedef {object} Props
 * @prop {number=} currentPage
 * @prop {number=} numOfPages
 * @prop {( ((page: number) => void) | boolean | null )=} onPressPage
 * @prop {( (() => void) | boolean | null )=} onPressSkip If defined, an skip buttn will be shown and
 * this prop will be called() when pressing on it.
 */

/**
 * @augments React.PureComponent<Props, {}, never>
 */
export default class ModalScreen extends React.PureComponent {
  /** @param {number} page */
  onPressPage = page => {
    const { onPressPage } = this.props

    typeof onPressPage === 'function' && onPressPage(page)
  }

  onPressSkip = () => {
    const { onPressSkip } = this.props

    typeof onPressSkip === 'function' && onPressSkip()
  }

  render() {
    const { currentPage, numOfPages: _numOfPages, onPressSkip } = this.props
    const showSkipBtn = typeof onPressSkip === 'function'

    const hasPages =
      typeof currentPage === 'number' || typeof _numOfPages === 'number'

    const numOfPages = (() => {
      let n = 0

      if (typeof _numOfPages === 'number') {
        n = _numOfPages
      }

      if (typeof currentPage === 'number') {
        // Gracefully handle cases like currPage = 4, numOfPages = 1
        n = Math.max(n, currentPage + 1)
      }

      return n
    })()

    return (
      <ShockBackground>
        <View style={styles.container}>
          <View style={styles.modal}>
            <View style={CSS.styles.flex}>{this.props.children}</View>

            {(hasPages || showSkipBtn) && <Pad amount={16} />}

            {showSkipBtn && (
              <Text onPress={this.onPressSkip} style={xStyles.skip}>
                {'Skip >'}
              </Text>
            )}

            {hasPages && (
              <View style={xStyles.pages}>
                {range(0, numOfPages).map(i => (
                  <PageBtn
                    page={i}
                    key={i}
                    isSelected={currentPage === i}
                    onPress={this.onPressPage}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ShockBackground>
    )
  }
}

const styles = StyleSheet.create({
  /* Transparent container */
  container: {
    flex: 1,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 80,
  },

  /*  The rounded white square in the center */
  modal: {
    flex: 1,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: CSS.Colors.BACKGROUND_WHITE,

    shadowColor: CSS.Colors.BACKGROUND_BLACK,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,

    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    paddingRight: 36,
  },

  skip: {
    marginBottom: 48,
  },
})

const xStyles = {
  pages: [CSS.styles.deadCenter, CSS.styles.flexRow],
  skip: [
    CSS.styles.alignSelfEnd,
    CSS.styles.fontSize22,
    CSS.styles.fontMontserratBold,
    styles.skip,
  ],
}
