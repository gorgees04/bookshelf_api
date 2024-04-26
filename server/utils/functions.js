const capitalize = (str) => {
  const strArr = str.toLowerCase().split(" ");
  const capArr = strArr.map((word) =>
    word.replace(word[0], word[0].toUpperCase())
  );
  return capArr.join(" ");
};

module.exports = { capitalize };
