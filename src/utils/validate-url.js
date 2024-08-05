module.exports.isValidUrl = (url) => {
  const urlPattern = new RegExp(
    /^https:\/\/([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  );

  return urlPattern.test(url);
};
