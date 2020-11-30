# Contributing

- Do not dispatch actions in componentDidMount, use react-navigation's didFocus instead. Components and and will get mounted by react-navigation even if they are not navigated to by the user.

- Non-rendering components such as `<StatusBar>` and `react-navigation`'s `<NavigationEvents />` should be rendered at the topmost level posible outside components that are actually related, example:

```tsx
function Login() {
    return (
        <>
            <StatusBar color="black" />
            <NavigationEvents didFocus={() => console.log('focused')}>
        </>
    )
}
```
