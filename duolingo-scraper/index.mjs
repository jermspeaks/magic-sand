import fs from "fs/promises";
import getHanzi from "./getHanzi.mjs";
import getCharacterWords from "./fetch.mjs";

const grabAllCharacterWords = async () => {
  const hanziCharacters = getHanzi();
  const limitedCharacters = hanziCharacters;

  // Create an array of promises
  const wordsPromises = limitedCharacters.map(async (character) => {
    const words = await getCharacterWords(character);
    console.log(words);
    return words;
  });

  // Wait for all promises to resolve
  const wordsArrays = await Promise.all(wordsPromises);

  // Concatenate all words arrays into a single array
  const finalWords = wordsArrays.flat();

  return finalWords;
};

const wordsToJson = (words) => {
  return words.flat();
};

const wordsToOutput = (words) => {
  const flattenedWords = words.flat();
  // map through flattenedWords and output as `${text} ${pinyin};${translation}`
  const output = flattenedWords.map((word) => {
    return `${word.text} ${word.pinyin};${word.translation}`;
  });

  return output.join("\n");
};

const writeToFile = async (output) => {
  const filePath = "./chinese_characters.json";
  await fs.writeFile(filePath, output);
  console.log(`Output written to ${filePath}`);
};

const run = async () => {
  const words = await grabAllCharacterWords();
  // const output = wordsToOutput(words);
  const output = wordsToJson(words);
  await writeToFile(JSON.stringify(output));
};

(async () => {
  try {
    await run();
  } catch (error) {
    console.error(error);
  }
})();
