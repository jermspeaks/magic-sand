import json from "./alphabets.json" assert { type: "json" };

const getHanzi = () => {
  const hanziAlphabet = json.alphabets.filter(
    (alphabet) => alphabet.alphabetSessionId === "hanzi"
  );
  // Want to flatten the `groups` array, the `characterGroups` array, and `characters`
  // and output an array of `character` which is a string
  const hanziCharacters = hanziAlphabet[0].groups.flatMap((group) =>
    group.characters.flatMap((ch) =>
      ch.map((group) => {
        return group?.character;
      })
    )
  );
  const fullCharacters = hanziCharacters.filter((ch) => ch);
  // unique array of characters
  const uniqueCharacters = [...new Set(fullCharacters)];
  return uniqueCharacters;
};

// const allCharacters = getHanzi();

// console.log(allCharacters);
// console.log(allCharacters.length);

export default getHanzi;
