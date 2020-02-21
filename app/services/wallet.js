import Http from 'axios'

import * as Cache from './cache'
import * as Utils from './utils'

/**
 * @typedef {object} Bytes
 * @prop {string} type
 * @prop {number[]} data
 */

/**
 * @typedef {string} Int64
 * @typedef {string} Int32
 */

/**
 * https://api.lightning.community/#transaction
 * @typedef {object} Transaction
 * @prop {string} tx_hash The transaction hash
 * @prop {Int64} amount The transaction amount, denominated in satoshis
 * @prop {Int32} num_confirmations The number of confirmations
 * @prop {string} block_hash The hash of the block this transaction was included
 * in
 * @prop {number} block_height The height of the block this transaction was
 * included in
 * @prop {Int64} time_stamp Timestamp of this transaction
 * @prop {Int64} total_fees Fees paid for this transaction
 * @prop {string[]} dest_addresses Addresses that received funds for this
 * transaction
 * @prop {string=} raw_tx_hex The raw transaction hex.
 */

/**
 * NOT based on any lightning API. Not supported by API as of commit
 * ed93a9e5c3915e1ccf6f76f0244466e999dbc939 .
 * @typedef {object} NonPaginatedTransactionsRequest
 * @prop {false} paginate
 */

/**
 * NOT based on any lightning API.
 * @typedef {object} PaginatedTransactionsRequest
 * @prop {number} page
 * @prop {true} paginate
 * @prop {number} itemsPerPage
 */

/**
 * https://api.lightning.community/#grpc-response-transactiondetails . Not
 * supported by API as of commit ed93a9e5c3915e1ccf6f76f0244466e999dbc939 .
 * @typedef {object} NonPaginatedTransactionsResponse
 * @prop {Transaction[]} transactions
 */

/**
 * @typedef {object} PaginatedTransactionsResponse
 * @prop {Transaction[]} content
 * @prop {number} page
 * @prop {number} totalPages
 * @prop {number} totalItems
 */

/**
 * Partially based on: https://api.lightning.community/#payment
 * @typedef {object} Payment
 * @prop {string} payment_hash  The payment hash
 * @prop {Int64} value  Deprecated, use value_sat or value_msat.
 * @prop {Int64} creation_date  The date of this payment
 * @prop {string[]} path The path this payment took
 * @prop {Int64} fee Deprecated, use fee_sat or fee_msat.
 * @prop {string} payment_preimage  The payment preimage
 * @prop {Int64} value_sat  The value of the payment in satoshis
 * @prop {Int64} value_msat  The value of the payment in milli-satoshis
 * @prop {string} payment_request  The optional payment request being fulfilled.
 * @prop {'UNKNOWN'|'IN_FLIGHT'|'SUCCEEDED'|'FAILED'} status  The status of the
 * payment.
 * @prop {(DecodedPayReq)=} decodedPayment The decoded payment request
 * @prop {(Int64)=} fee_sat  The fee paid for this payment in satoshis
 * @prop {(Int64)=} fee_msat  The fee paid for this payment in milli-satoshis
 */
/**
 * https://api.lightning.community/#hophint
 * @typedef {object} HopHint
 * @prop {string} node_id The public key of the node at the start of the
 * channel.
 * @prop {number} chan_id The unique identifier of the channel.
 * @prop {number} fee_base_msat The base fee of the channel denominated in
 * millisatoshis.
 * @prop {number} fee_proportional_millionths The fee rate of the channel for
 * sending one satoshi across it denominated in millionths of a satoshi.
 * @prop {number} cltv_expiry_delta The time-lock delta of the channel.
 */

/**
 * https://api.lightning.community/#routehint
 * @typedef {object} RouteHint
 * @prop {HopHint[]} hop_hints A list of hop hints that when chained together
 * can assist in reaching a specific destination.
 */

/**
 * https://api.lightning.community/#invoice
 * @typedef {object} Invoice
 * @prop {string} memo  An optional memo to attach along with the invoice. Used
 * for record keeping purposes for the invoice's creator, and will also be set
 * in the description field of the encoded payment request if the
 * description_hash field is not being used.
 * @prop {Bytes} receipt  Deprecated. An optional cryptographic receipt of
 * payment which is not implemented.
 * @prop {Bytes} r_preimage The hex-encoded preimage (32 byte) which will allow
 * settling an incoming HTLC payable to this preimage
 * @prop {Bytes} r_hash The hash of the preimage
 * @prop {Int64} value  The value of this invoice in satoshis
 * @prop {boolean} settled Whether this invoice has been fulfilled
 * @prop {Int64} creation_date  When this invoice was created
 * @prop {Int64} settle_date  When this invoice was settled
 * @prop {string} payment_request A bare-bones invoice for a payment within the
 * Lightning Network. With the details of the invoice, the sender has all the
 * data necessary to send a payment to the recipient.
 * @prop {Bytes} description_hash Hash (SHA-256) of a description of the
 * payment. Used if the description of payment (memo) is too long to naturally
 * fit within the description field of an encoded payment request.
 * @prop {Int64} expiry Payment request expiry time in seconds. Default is 3600
 * (1 hour).
 * @prop {string} fallback_addr Fallback on-chain address.
 * @prop {Int64} cltv_expiry Delta to use for the time-lock of the CLTV extended
 * to the final hop.
 * @prop {RouteHint[]} route_hints RouteHint  Route hints that can each be
 * individually used to assist in reaching the invoice's destination.
 * @prop {boolean} private Whether this invoice should include routing hints for
 * private channels.
 * @prop {Int64} add_index The "add" index of this invoice. Each newly created
 * invoice will increment this index making it monotonically increasing. Callers
 * to the SubscribeInvoices call can use this to instantly get notified of all
 * added invoices with an add_index greater than this one.
 * @prop {Int64} settle_index  The "settle" index of this invoice. Each newly
 * settled invoice will increment this index making it monotonically increasing.
 * Callers to the SubscribeInvoices call can use this to instantly get notified
 * of all settled invoices with an settle_index greater than this one.
 * @prop {Int64} amt_paid Deprecated, use amt_paid_sat or amt_paid_msat.
 * @prop {Int64} amt_paid_sat The amount that was accepted for this invoice, in
 * satoshis. This will ONLY be set if this invoice has been settled. We provide
 * this field as if the invoice was created with a zero value, then we need to
 * record what amount was ultimately accepted. Additionally, it's possible that
 * the sender paid MORE that was specified in the original invoice. So we'll
 * record that here as well.
 * @prop {Int64} amt_paid_msat The amount that was accepted for this invoice, in
 * millisatoshis. This will ONLY be set if this invoice has been settled. We
 * provide this field as if the invoice was created with a zero value, then we
 * need to record what amount was ultimately accepted. Additionally, it's
 * possible that the sender paid MORE that was specified in the original
 * invoice. So we'll record that here as well.
 * @prop {'OPEN'|'SETTLED'|'CANCELED'|'ACCEPTED'} state The state the invoice is
 * in. OPEN 0 SETTLED 1 CANCELED 2 ACCEPTED 3
 */

/**
 * NOT based on any lightning API.
 * @typedef {object} WalletBalanceResponse
 * @prop {string} total_balance The balance of the wallet
 * @prop {string} confirmed_balance The confirmed balance of a wallet(with >= 1
 * confirmations)
 * @prop {string} unconfirmed_balance The unconfirmed balance of a wallet(with 0
 * confirmations)
 * @prop {string} channel_balance The balance of all channels open to this node
 * @prop {string} pending_channel_balance The balance of all channels that are
 * pending to be opened to this node
 */

/**
 * NOT based on any lightning API.
 * @typedef {object} PaginatedListPaymentsRequest
 * @prop {number} page
 * @prop {true} paginate
 * @prop {number} itemsPerPage
 * @prop {boolean} include_incomplete If true, then return payments that have
 * not yet fully completed. This means that pending payments, as well as failed
 * payments will show up if this field is set to True.
 * https://api.lightning.community/#grpc-request-listpaymentsrequest
 */

/**
 * @typedef {object} PaginatedListPaymentsResponse
 * @prop {Payment[]} content
 * @prop {number} page
 * @prop {number} totalPages
 * @prop {number} totalItems
 */

/**
 * Not supported in API as of commit ed93a9e5c3915e1ccf6f76f0244466e999dbc939 .
 * https://api.lightning.community/#grpc-request-listinvoicerequest
 * @typedef {object} ListInvoiceRequest
 * @prop {boolean=} pending_only If set, only unsettled invoices will be returned
 * in the response.
 * @prop {number=} index_offset The index of an invoice that will be used as
 * either the start or end of a query to determine which invoices should be
 * returned in the response.
 * @prop {number=} num_max_invoices The max number of invoices to return in the
 * response to this query.
 * @prop {boolean=} reversed If set, the invoices returned will result from
 * seeking backwards from the specified index offset. This can be used to
 * paginate backwards.
 */

/**
 * Not supported in API as of commit ed93a9e5c3915e1ccf6f76f0244466e999dbc939 .
 * @typedef {object} ListInvoiceResponse
 * @prop {Invoice[]} invoices A list of invoices from the time slice of the time
 * series specified in the request.
 * @prop {number} last_index_offset The index of the last item in the set of
 * returned invoices.This can be used to seek further, pagination style.
 * @prop {number} first_index_offset The index of the last item in the set of
 * returned invoices. This can be used to seek backwards, pagination style.
 */

/**
 * NOT based on any lightning API.
 * @typedef {object} PaginatedListInvoicesRequest
 * @prop {number} itemsPerPage
 * @prop {number} page
 */

/**
 * NOT based on any lightning API.
 * @typedef {object} PaginatedListInvoicesResponse
 * @prop {Invoice[]} content
 * @prop {number} page
 * @prop {number} totalPages
 */

/**
 * https://api.lightning.community/#grpc-request-newaddressrequest
 * @typedef {object} NewAddressRequest
 * @prop {0|1|2|3} type The address type. WITNESS_PUBKEY_HASH 0
 * NESTED_PUBKEY_HASH 1 UNUSED_WITNESS_PUBKEY_HASH 2 UNUSED_NESTED_PUBKEY_HASH 3
 */
/**
 * @typedef {object} Chain
 * @prop {string[]} chan_points	Is the set of all channels that are included in this multi-channel backup.
 * @prop {bytes} multi_chan_backup	A single encrypted blob containing all the static channel backups of the channel listed above. This can be stored as a single file or blob, and safely be replaced with any prior/future versions. When using REST, this field must be encoded as base64.
 */

/**
 * @typedef {object} GetInfo
 * @prop {string} version	The version of the LND software that the node is running.
 * @prop {string} identity_pubkey	The identity pubkey of the current node.
 * @prop {string} alias	If applicable, the alias of the current node, e.g. "bob"
 * @prop {string} color	The color of the current node in hex code format
 * @prop {string} num_pending_channels	Number of pending channels
 * @prop {string} num_active_channels	Number of active channels
 * @prop {string} num_inactive_channels	Number of inactive channels
 * @prop {string} num_peers	Number of peers
 * @prop {string} block_height	The node's current view of the height of the best block
 * @prop {string} block_hash	The node's current view of the hash of the best block
 * @prop {string} best_header_timestamp	Timestamp of the block best known to the wallet
 * @prop {boolean} synced_to_chain	Whether the wallet's view is synced to the main chain
 * @prop {boolean} synced_to_graph	Whether we consider ourselves synced with the public channel graph.
 * @prop {boolean} testnet	Whether the current node is connected to testnet. This field is deprecated and the network field should be used instead
 * @prop {Chain[]} chains Chain	A list of active chains the node is connected to
 * @prop {string[]} uris string	The URIs of the current node.
 * @prop {array} features FeaturesEntry	Features that our node has advertised in our init message, node announcements and invoices.
 */

/**
 * https://api.lightning.community/#grpc-response-newaddressresponse
 * @typedef {object} NewAddressResponse
 * @prop {string} address The newly generated wallet address.
 */
export const NO_CACHED_TOKEN = 'NO_CACHED_TOKEN'

/**
 * @param {Invoice|Payment|Transaction} item
 * @returns {item is Invoice}
 */
export const isInvoice = item => {
  const i = /** @type {Invoice} */ (item)

  if (typeof i.r_hash !== 'object') {
    return false
  }

  if (typeof i.memo !== 'string') {
    return false
  }

  if (!Array.isArray(i.route_hints)) {
    return false
  }

  return true
}

/**
 * @param {Invoice|Payment|Transaction} item
 * @returns {item is Payment}
 */
export const isPayment = item => {
  const p = /** @type {Payment} */ (item)

  return typeof p.payment_hash === 'string'
}

/**
 * @param {Invoice|Payment|Transaction} item
 * @returns {item is Transaction}
 */
export const isTransaction = item => {
  const t = /** @type {Transaction} */ (item)

  return typeof t.tx_hash === 'string'
}

/**
 * @returns {Promise<number>}
 */
export const USDExchangeRate = async () => {
  const endpoint = 'https://api.coindesk.com/v1/bpi/currentprice.json'
  const { data } = await Http.get(endpoint)

  const er = data.bpi.USD.rate_float

  if (typeof er !== 'number') {
    throw new TypeError('Exchange rate obtained from server not a number')
  }

  return er
}

/**
 * @returns {Promise<WalletBalanceResponse>}
 */
export const balance = async () => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  try {
    const endpoint = `/api/lnd/balance`

    const { data } = await Http.get(endpoint, {
      headers: {
        Authorization: token,
      },
    })

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * Returns a list describing all the known regular bitcoin network transactions
 * relevant to the wallet.
 * https://api.lightning.community/#gettransactions
 * @param {PaginatedTransactionsRequest} request
 * @throws {Error|TypeError} NO_CACHED_TOKEN - If no token is found. A generic
 * error otherwise, if returned by the API.
 * @returns {Promise<PaginatedTransactionsResponse>}
 */
export const getTransactions = async request => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  try {
    const { data } = await Http.get(
      `/api/lnd/transactions?paginate=true&page=${request.page}&itemsPerPage=${request.itemsPerPage}`,
      { headers: { Authorization: token } },
    )

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * Alias for getTransactions().
 */
export const getRegularBitcoinTransactions = getTransactions

/**
 * AKA paid outgoing invoices.
 *
 * https://api.lightning.community/#listpayments
 * @param {PaginatedListPaymentsRequest} request
 * @returns {Promise<PaginatedListPaymentsResponse>}
 */
export const listPayments = async request => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const url = `/api/lnd/listpayments?paginate=true&page=${
    request.page
  }&itemsPerPage=${request.itemsPerPage}${
    request.include_incomplete ? '&include_incomplete' : ''
  }`

  try {
    const { data } = await Http.get(url, { headers: { Authorization: token } })

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * Returns a list of all the invoices currently stored within the database. Any
 * active debug invoices are ignored. It has full support for paginated
 * responses, allowing users to query for specific invoices through their
 * add_index. This can be done by using either the first_index_offset or
 * last_index_offset fields included in the response as the index_offset of the
 * next request. By default, the first 100 invoices created will be returned.
 * Backwards pagination is also supported through the Reversed flag.
 * https://api.lightning.community/?javascript#listinvoices
 * @param {PaginatedListInvoicesRequest} request
 * @returns {Promise<PaginatedListInvoicesResponse>}
 */
export const listInvoices = async request => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/listinvoices`

  const url = Utils.getQueryParams(endpoint, request)

  try {
    const { data } = await Http.get(url, {
      headers: {
        Authorization: token,
      },
    })

    return data
  } catch (err) {
    const { response } = err
    if (!response) {
      throw err
    }

    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * Alias for listInvoices().
 */
export const listGeneratedInvoices = listInvoices

/**
 * Generates a new regular bitcoin address. Defaults to p2wkh.
 * @param {boolean=} useOlderFormat Will request a nested pubkey hash (np2wkh).
 * @throws {Error}
 * @returns {Promise<string>}
 */
export const newAddress = async useOlderFormat => {
  // return new Promise(res => {
  //   setTimeout(() => {
  //     res(
  //       useOlderFormat
  //         ? '347N1Thc213QqfYCz3PZkjoJpNv5b14kBd'
  //         : '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
  //     )
  //   }, 1500)
  // })

  /** @type {NewAddressRequest} */
  const req = {
    type: useOlderFormat ? 1 : 0,
  }

  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/newaddress`

  try {
    const { data } = await Http.post(endpoint, req, {
      headers: {
        Authorization: token,
      },
    })

    return /** @type {NewAddressResponse} */ data.address
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * https://api.lightning.community/?javascript#grpc-request-invoice
 * @typedef {object} AddInvoiceRequest
 * @prop {number} expiry Payment request expiry time in seconds.
 * @prop {string} memo An optional memo to attach along with the invoice. Used
 * for record keeping purposes for the invoice's creator, and will also be set
 * in the description field of the encoded payment request if the
 * description_hash field is not being used.
 * @prop {number} value
 */

/**
 * https://api.lightning.community/?javascript#grpc-response-addinvoiceresponse
 * @typedef {object} AddInvoiceResponse
 * @prop {string} r_hash
 * @prop {string} payment_request A bare-bones invoice for a payment within the
 * Lightning Network. With the details of the invoice, the sender has all the
 * data necessary to send a payment to the recipient.
 * @prop {number} add_index The "add" index of this invoice. Each newly created
 * invoice will increment this index making it monotonically increasing.
 * Callers to the SubscribeInvoices call can use this to instantly get notified
 * of all added invoices with an add_index greater than this one.
 */

/**
 * https://api.lightning.community/?javascript#grpc-response-addinvoiceresponse
 * @param {AddInvoiceRequest} request
 * @returns {Promise<AddInvoiceResponse>}
 */
export const addInvoice = async request => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/addinvoice`

  try {
    const { data } = await Http.post(endpoint, request, {
      headers: {
        Authorization: token,
      },
    })

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * https://api.lightning.community/#grpc-request-sendcoinsrequest
 * @typedef {object} PartialSendCoinsRequest
 * @prop {string} addr The address to send coins to.
 * @prop {number} amount The amount in satoshis to send.
 */

/**
 * https://api.lightning.community/#grpc-response-sendcoinsresponse
 * @typedef {object} SendCoinsResponse
 * @prop {string} txid The transaction ID of the transaction.
 */

/**
 * Resolves to the ID of the newly-created transaction.
 * @param {PartialSendCoinsRequest} request
 * @throws {Error}
 * @returns {Promise<string>}
 */
export const sendCoins = async request => {
  const { token } = await Cache.getNodeURLTokenPair()
  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/sendcoins`

  try {
    const { data } = await Http.post(endpoint, request, {
      headers: {
        Authorization: token,
      },
    })

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * https://api.lightning.community/#grpc-request-sendrequest
 * @typedef {object} PartialSendRequest
 * @prop {number=} amt CAUTION: Might override the invoice's amount if provided.
 * Should only be asked for when the invoice has no amount embedded in it.
 * @prop {string} payreq AKA invoice.
 */

/**
 * @typedef {object} Hop
 * @prop {number} chan_id
 * @prop {number} chan_capacity
 * @prop {number} amt_to_forward
 * @prop {number} fee
 * @prop {number} expiry
 * @prop {number} amt_to_forward_msat
 * @prop {number} fee_msat
 * @prop {string} pub_key
 */

/**
 * https://api.lightning.community/#route
 * @typedef {object} Route
 * @prop {number} total_time_lock
 * @prop {number} total_fees
 * @prop {number} total_amt
 * @prop {Hop[]} hops
 * @prop {number} total_fees_msat
 * @prop {number} total_amt_msat
 */

/**
 * https://api.lightning.community/#grpc-request-sendrequest
 * @typedef {object} SendResponse
 * @prop {string} payment_error
 * @prop {bytes} payment_preimage
 * @prop {Route} payment_route
 * @prop {bytes} payment_hash
 */

/**
 * Read PartialSendRequest.amt for warning.
 * @param {PartialSendRequest} request
 * @returns {Promise<SendResponse>}
 */
export const CAUTION_payInvoice = async ({ amt, payreq }) => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/sendpayment`

  try {
    const { data } = await Http.post(
      endpoint,
      { amt, payreq },
      {
        headers: {
          Authorization: token,
        },
      },
    )

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * https://api.lightning.community/#grpc-response-payreq
 * @typedef {object} DecodedPayReq
 * @prop {string} destination
 * @prop {string} payment_hash
 * @prop {string} num_satoshis
 * @prop {string} timestamp
 * @prop {string} expiry
 * @prop {string} description
 * @prop {string} description_hash
 * @prop {string} fallback_addr
 * @prop {string} cltv_expiry
 * @prop {RouteHint[]} route_hints
 */

/**
 * @typedef {object} DecodeInvoiceResponse
 * @prop {DecodedPayReq} decodedRequest
 */

/**
 * https://api.lightning.community/#grpc-request-payreqstring
 * @typedef {object} DecodeInvoiceRequest
 * @prop {string} payReq AKA Invoice
 */

/**
 * @param {DecodeInvoiceRequest} request
 * @returns {Promise<DecodeInvoiceResponse>}
 */
export const decodeInvoice = async ({ payReq }) => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/decodePayReq`

  try {
    const { data } = await Http.post(
      endpoint,
      { payReq },
      {
        headers: {
          Authorization: token,
        },
      },
    )

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}
/**@param {string} uri */
export const addPeer = async uri => {
  const isComplete = uri.split('@')
  console.log(isComplete)
  const req = {
    pubkey: isComplete[0],
    host: isComplete[1],
  }
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/connectpeer`

  try {
    const { data } = await Http.post(endpoint, req, {
      headers: {
        Authorization: token,
      },
    })

    return data
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * Partially based on https://api.lightning.community/#peer.
 * @typedef {object} Peer
 * @prop {string} address
 * @prop {string} pub_key
 * @prop {Int64} sat_sent
 * @prop {Int64} sat_recv
 */

/**
 * @returns {Promise<Peer[]>}
 */
export const listPeers = async () => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/listpeers`

  try {
    const { data } = await Http.get(endpoint, {
      headers: {
        Authorization: token,
      },
    })

    if (!Array.isArray(data.peers)) {
      throw new Error('Wallet.listPeers() -> body.peers not an array')
    }

    return data.peers
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown error.',
    )
  }
}

/**
 * Partially based on https://api.lightning.community/#channel.
 * @typedef {object} Channel
 * @prop {boolean} active
 * @prop {string} channel_point
 * @prop {string} ip
 * @prop {string} local_balance AKA Sendable
 * @prop {string} remote_balance AKA Receivable
 * @prop {string} remote_pubkey
 */

/**
 * @returns {Promise<Channel[]>}
 */
export const listChannels = async () => {
  const { token } = await Cache.getNodeURLTokenPair()

  if (typeof token !== 'string') {
    throw new TypeError(NO_CACHED_TOKEN)
  }

  const endpoint = `/api/lnd/listchannels`

  try {
    const { data } = await Http.get(endpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: token,
      },
    })

    const { channels } = data

    if (!Array.isArray(channels)) {
      throw new Error('Wallet.listChannels() -> body.channels not an array.')
    }

    const peers = await listPeers()

    return channels.map(chan => {
      const matchingPeer = peers.find(
        peer => peer.pub_key === chan.remote_pubkey,
      )

      return {
        ...chan,
        ip: matchingPeer ? matchingPeer.address : '???.???.???.???',
      }
    })
  } catch (err) {
    const { response } = err
    throw new Error(
      'listChannels() -> ' + response.data.errorMessage ||
        response.data.message ||
        'Unknown error.',
    )
  }
}

/**
 * @typedef {'locked'|'unlocked'|'noncreated'} WalletStatus
 */

/**
 * @returns {Promise<WalletStatus>}
 */
export const walletStatus = async () => {
  try {
    const { data } = await Http.get(`/api/lnd/wallet/status`)

    const { walletExists, walletStatus } = data

    if (walletExists) {
      return walletStatus
    }

    return 'noncreated'
  } catch (err) {
    const { response } = err
    throw new Error(
      response.data.errorMessage || response.data.message || 'Unknown Error',
    )
  }
}

/**
 * @typedef {object} NodeInfo
 * @prop {string[]} uris
 * @prop {boolean} synced_to_chain
 * @prop {boolean} synced_to_graph
 * @prop {string} identity_pubkey
 * @prop {string} best_header_timestamp
 * @prop {number} block_height
 * @prop {number} num_pending_channels
 * @prop {string} version
 */

/**
 * @returns {Promise<NodeInfo>}
 */
export const nodeInfo = async () => {
  try {
    const { data } = await Http.get(`/healthz`)

    if (!data || !data.LNDStatus || !data.LNDStatus.message) {
      // eslint-disable-next-line no-throw-literal
      throw {
        response: {
          data,
        },
      }
    }

    const { message } = data.LNDStatus

    return message
  } catch (err) {
    const { response } = err
    if (response) {
      const { data } = response
      if (typeof data !== 'object') {
        throw new TypeError(
          `Error fetching /healthz: data not an object, instead got: ${JSON.stringify(
            data,
          )}`,
        )
      }

      const { LNDStatus } = data
      if (typeof LNDStatus !== 'object') {
        throw new TypeError(
          `Error fetching /healthz: data.LNDStatus not an object`,
        )
      }

      const { message } = LNDStatus
      if (typeof message !== 'object') {
        throw new TypeError(
          `Error fetching /healthz: data.LNDStatus.message not an object`,
        )
      }

      throw new Error(data.errorMessage || data.message || 'Unknown Error')
    }
    throw new Error('Unable to connect to ShockAPI')
  }
}
