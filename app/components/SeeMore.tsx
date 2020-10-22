import React from 'react'
// @ts-expect-error
import SeeMoreOrig from 'react-native-see-more-inline'
import { TextProps } from 'react-native'

import * as CSS from '../res/css'

interface Props {
  children: string
  numberOfLines: number
  style: TextProps['style']
}

/**
 * SeeMore (the original) has a setState when unmounted bug
 * @param props
 */
const SeeMore: React.FC<Props> = ({ style, children }) => (
  <SeeMoreOrig
    style={style}
    numberOfLines={2}
    linkColor={CSS.Colors.DARK_MODE_CYAN}
    linkPressedColor={CSS.Colors.DARK_MODE_BORDER_GRAY}
  >
    {children}
  </SeeMoreOrig>
)

const MemoizedSeeMore = React.memo(SeeMore)

export default MemoizedSeeMore
