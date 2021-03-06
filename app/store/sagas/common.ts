import { Store } from 'redux'
import { put as origPut } from 'redux-saga/effects'

import { Action } from '../actions'
import { State } from '../reducers'

type R<T> = T extends Promise<infer U> ? U : T
export type YieldReturn<T> = R<
  ReturnType<T extends (...args: any) => any ? T : any>
>

type ShockStore = Store<State, Action>

let currStore = {} as ShockStore

export const _setStore = (store: ShockStore) => {
  currStore = store
}

export const getStore = () => currStore

export const put = (action: Action) => origPut<Action>(action)
