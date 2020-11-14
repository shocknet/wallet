# Sagas

Sagas are preferred over thunks because:

- No overloading of `dispatch()`.
- More expresiveness power.
- Called on every store tick so they can react to state changes.

## Guidelines

- Call `_setStore()` on store creation but before running the root saga.
- Sagas can import from services, actions and selectors but not from reducers.
- Use `getStore()` from `common` and not from elsewhere.
- In the future we should switch to channel events to avoid the `getStore()` conundrum.
- Ping saga handles online state.
- Build and connect sockets/polls when `Selectors.isReady(yield select())` returns true, disconnect them and tear them down when false, this simplifies token/user handling.
- Do not do conditional dispatch based on state inside the saga, let the reducer handle the action as it seems fit, reducers are pure and are more easily testable, only check for
- Use `YieldReturn<T>` for type safety.
