async function urlValidator(httpClient, url) {
  if (!httpClient || !url) {
    return false;
  }

  try {
    const response = await httpClient.head(url);
    return response.status < 400;
  } catch (e) {
    console.log(`Validation failure - failed to send a request to ${url}`);
  }

  return false;
}

module.exports = urlValidator;