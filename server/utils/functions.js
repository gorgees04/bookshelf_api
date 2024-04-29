const capitalize = (str) => {
  const strArr = str.toLowerCase().split(" ");
  const capArr = strArr.map((word) =>
    word.replace(word[0], word[0].toUpperCase())
  );
  return capArr.join(" ");
};

// res not found function

const notFound = (arr, res) => {
  try {
    if (!arr) {
      return res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { capitalize, notFound };
