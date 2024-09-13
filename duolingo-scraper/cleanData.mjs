import fs from "fs/promises";
import chineseCharacters from "./chinese_characters.json" assert { type: "json" };

const cleanData = () => {
  // Remove unique sets of characters and translations
  // If the translations are not the same, please combine those into one using a comma as a delimiter
  const differentTranslations = chineseCharacters.map((curr) => {
    const { text, translation } = curr;
    const otherTranslations =
      chineseCharacters.filter((item) => {
        return item.text === text && item.translation !== translation;
      }) ?? [];
    // console.log(otherTranslations);
    if (otherTranslations.length > 0) {
      const combinedTranslations = [curr, ...otherTranslations]
        .map((item) => item.translation)
        .join(", ");
      return {
        ...curr,
        translation: combinedTranslations,
      };
    }
    return curr;
  });
  const uniqueCharacters = differentTranslations.reduce((acc, curr) => {
    const { text } = curr;
    if (!acc.some((item) => item.text === text)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  return uniqueCharacters;
};

const wordsToOutput = (words) => {
  const flattenedWords = words.flat();
  // map through flattenedWords and output as `${text} ${pinyin};${translation}`
  const output = flattenedWords.map((word) => {
    return `${word.text}；${word.pinyin} （${word.translation}）`;
  });

  return output.join("\n");
};

const writeToFile = async (output) => {
  const filePath = "./chinese_characters.txt";
  await fs.writeFile(filePath, output);
  console.log(`Output written to ${filePath}`);
};

(async () => {
  try {
    console.log("Starting");
    const words = cleanData();
    // console.log("words", words);
    const output = wordsToOutput(words);
    // console.log(output);
    await writeToFile(output);
  } catch (error) {
    console.error(error);
  }
})();

export default cleanData;
