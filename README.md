
# ShockWallet Alpha
[![GitHub last commit](https://img.shields.io/github/last-commit/shocknet/wallet?style=flat-square)](https://github.com/shocknet/wallet/commits/master)
[![GitHub](https://img.shields.io/github/license/shocknet/wallet?label=license&style=flat-square)](https://github.com/shocknet/wallet/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) 
[![Chat](https://img.shields.io/badge/chat-on%20Telegram-blue?style=flat-square)](https://t.me/Shockwallet)
[![Twitter Follow](https://img.shields.io/twitter/follow/ShockBTC?style=flat-square)](https://twitter.com/shockbtc)

Shockwallet connects to your remote Lightning node, it overlays [graph user nodes](https://gun.eco/) for a decentralized social network.

Running a Shockwallet node requires the [Shock API](https://github.com/shocknet/api) backend, and [LND](https://github.com/lightningnetwork/lnd)

## Features:


- [X] Basic LND Channel and Peer Management
- [X] Fee Control
- [X] LNURL-Pay, Withdraw and Channel
- [X] Social Personas
- [X] Automatic Seed and Channel Backup
- [X] E2EEncrypted Chat Messaging
- [X] Online Presence Indication
- [X] Sender-Initiated Payments
- [X] Provider-less Notificationshttp://bitcoin:bc1q2pn0rf92mt3pznjxq9gg3wkmjv0cmuy88tmfl8
- [X] Node-Disconnected Notification Settings
- [X] LND 10 with Keysend & Multi-Shard Payments
- [X] Liquidity Pre-Checks
- [X] Torrent Content Streaming
- [X] Torrent Publishing and Seed Service
- [X] Guest Webclient (prototype)
- [ ] Advanced Coin Control
- [ ] Advanced Channel Management
- [ ] Automatic Swaps
- [ ] Portable LNURL-Auth Keyring


## [Download Android APK](https://github.com/shocknet/wallet/releases/download/pre2.2/app-release.apk)

_Node installer available at [shocknet/Wizard](https://github.com/shocknet/wizard)_


### Build from source

#### Android: 

Requires Android Studio and React-Native CLI

```
git clone https://github.com/shocknet/wallet
cd wallet
yarn install
react-native run-android //to run in Android Studio emulator
yarn build:release //to build APK
```

#### iOS:

Help Wanted: `bc1q2pn0rf92mt3pznjxq9gg3wkmjv0cmuy88tmfl8`

<hr></hr>

**If you find any issues with this project, or would like to suggest an enhancement, please [tell us](https://github.com/shocknet/Wizard/issues).**

© 2020 [Shock Network, Inc.](https://shockwallet.app)
