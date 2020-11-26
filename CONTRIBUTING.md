# Contributing

- Do not dispatch actions in componentDidMount, use react-navigation's didFocus instead. Components and and will get mounted by react-navigation even if they are not navigated to by the user.
