/**
 * @param {string} host
 * @param {string} accessToken
 * @param {string} error
 */
const report = (host, accessToken, error) => {
  const endpoint = `${host}/api/mobile/errors`
  const payload = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({
      time: new Date(),
      error,
    }),
  }

  fetch(endpoint, payload)
    .then()
    .catch()
}

export default report
