// Function to encode string to url encoded string
export function urlEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

const getCharacterWords = async (character) => {
  console.log("Getting character words for", character);
  const encodedCharacter = urlEncode(character);
  const alphabetsPathProgressKey =
    process.env.DUOLINGO_ALPHABET_PATH_PROGRESS_KEY;
  const response = await fetch(
    `https://www-prod.duolingo.com/2017-06-30/alphabets/courses/zh/en/expandedViewInfo/${encodedCharacter}?alphabetsPathProgressKey=${alphabetsPathProgressKey}&expandedViewId=${encodedCharacter}&fromLanguage=en&learningLanguage=zh`,
    {
      headers: {
        accept: "application/json; charset=UTF-8",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${process.env.DUOLINGO_TOKEN}`,
        priority: "u=1, i",
        cookie: process.env.DUOLINGO_COOKIE,
        Referer: "https://www.duolingo.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );

  try {
    const json = await response.json();
    const words = json.sections
      .map(({ words }) => words)
      .map((word) => {
        return word.map((t) => {
          return {
            text: t.text,
            translation: t.translation,
            transliteration: t.transliteration,
            pinyin: t.transliterationObj.tokens.reduce((acc, obj, index) => {
              const text = obj.transliterationTexts[0].text;
              if (index === 0) {
                return text;
              }
              return `${acc} ${text}`;
            }, ""),
          };
        });
      });
    // console.log(words);
    return words;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// // Invoke the async function properly
// (async () => {
//   const words = await getCharacterWords("馆");
//   console.log(words);
// })();

export default getCharacterWords;
