
# ShockWallet Alpha

Shockwallet connects to your remote Lightning node, it overlays [graph user nodes](https://github.com/amark/gun) for a decentralized social network, with commerce and Torrent content.

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
- [X] Provider-less Notifications
- [X] Node-Disconnected Notification Settings
- [X] LND 10 with Keysend & Multi-Shard Payments
- [X] Liquidity Pre-Checks
- [X] Torrent Content Streaming
- [X] Torrent Publishing and Seed Service
- [X] Guest Webclient
- [ ] Advanced Coin Control
- [ ] Advanced Channel Management
- [ ] Automatic Swaps


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

Help Wanted: bc1q2pn0rf92mt3pznjxq9gg3wkmjv0cmuy88tmfl8

<hr></hr>

**If you find any issues with this project, or would like to suggest an enhancement, please [tell us](https://github.com/shocknet/Wizard/issues).**

[ISC License](https://opensource.org/licenses/ISC)
© 2020 [Shock Network, Inc.](http://shock.network)
