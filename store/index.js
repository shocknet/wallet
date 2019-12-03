import { createStore, applyMiddleware, combineReducers } from 'redux'
import { persistStore } from 'redux-persist'
import thunk from 'redux-thunk'
import reducers from '../reducers'

const combinedReducers = combineReducers(reducers)

export default () => {
  const store = createStore(combinedReducers, applyMiddleware(thunk))
  const persistor = persistStore(store)

  return { persistor, store }
}
