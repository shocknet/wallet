/**
 * @format
 */
import React from 'react'
import QRCode from 'react-native-qrcode-svg'
/**
 * @typedef {import('react-native-qrcode-svg').QRCodeProps} _QRCodeProps
 */

/**
 * @type {Record<'btc'|'shock', string>}
 */
const LOGO = {
  btc:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfjCgUPEjRzduhEAAABgElEQVRIx82VPSxDURTHf1Ui9ZF6OmDzMQhVS01CkDBZJBLpYJBIakMkJquJwWqSSGqQWFWiYkF0lEZiEDUQiY+kBtEocg309r547/W9voFzl/8975zfuR8v54KRbSAQRIAxBIItTK0Ml/b3gHKpAvilrgWgi2G6AaihkrdiqDWExfjgkm3G8ZYKyI8UHe7OIMQ+9eafvQzwKqstEybMEDPEdatYsq6RkIFRxTupABLWW3g3xMa4kNpvDTCzJ6kypQDa6ZF6zymghTmO8f3Mzli3Dt+Vh/XIFbdkdTdwiFasXrzIr3TKoDuA4JMpe4B5NDQCBJlgk5yCeKHBDiCq83fzrCCmnV4jpFhVZm3OAXBn5HQCGFH0jTmg2jDZzwoRZX6UF4WW5mERD030SU8/AHU0EqKXKiX9hPPfNZptdSSBIEOn0SJHbaYn9emFLQQtD1BwzzUHxEmahfjQ5IghEMzSygICwQ4VZmmFFWTJSv39BjyQJg1AzqRP8R+eNteAL3+b3x/9c2iUAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTEwLTA1VDE1OjE4OjUyKzAwOjAwRiopQwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0xMC0wNVQxNToxODo1MiswMDowMDd3kf8AAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC',
  shock:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABzUlEQVRYw82Xv04CQRDGvxOQTq6isqAjFCRooTaGQh+AR9AXEB7l6Cxt7MQQnwA6sbrYGBuxofAaQUOIIDc2u6fH/Zt1CTDJVbs7v292Z+dmDSLCOm1LYW4BQANAB8AQAC18QzHWEHN5RkRJX4WIOqRuHbE21n/coElEFumbJXwpCTCJyKblmR0lYhXwWBGrgkeKMBauoQWgzkneyV0VNB6EjqV2T5E9voxa2hQ3JXANK1z43OlFwgEgXTyPW14XrIAAi3t15y+t6MKSP0Aqf5jkwloUUABQZdWN6Qe++7eR45kyaxOrslhJATV29H3t6PGXqSxg9nylG32ogIpu8ilG7zGlgJxu8ilG7zFlHSBO8k1a+7Hn76sF+SNkyhdJbo30MpIPAFzn4VeMWUK6eMbyyxbgjge+KOn9CTT7DO6EWUL25BrG9g7LrzyCITcPvFJ8sxcQoAgfATBlEtoqcDcketXIJVMKaCsJcO514R7zXwLmTk8XHhDwCqDL3oG3ni68K5i+v2FD5fw14IjqB2zRLCSevya86Ut61ZZs+tgk92u0tJZs45rSjWjLN+JhsrKnmaHwOi6ILqYmmolcSG23RYFpy3vO/RmtzX4AHd8PKalCNUYAAAAASUVORK5CYII=',
}

/**
 * @typedef {object} _Props
 * @prop {'btc'|'shock'} logoToShow
 */

/**
 * @typedef {_Props & _QRCodeProps} Props
 */

/** @type {React.FC<Props>} */
const _QR = ({ logoToShow, ...otherProps }) => ((
  <QRCode
    {...otherProps}
    logo={{
      uri: LOGO[logoToShow],
    }}
  />
))

const QR = React.memo(_QR)

export default QR
