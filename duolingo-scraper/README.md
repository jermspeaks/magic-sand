# Duolingo Chinese Web Scrapper

Reverse engineering Duolingo's API to make custom Anki decks.

## Goals

I want an Anki import text file I can use to create two different decks from their Chinese language set:

- Pinyin
- Vocabulary

The pinyin practice allows me to practice writing. My near term goal is to be able to text message with others.

## Where the data comes from

On the Duolingo website, there is an API to grab all of the characters. `/alphabets` will grab all of the chinese sounds and characters. However, these aren't the entire set of vocabulary as it's only for introducing new single character sets. You have to grab it from another API, which is in `fetch.mjs`.

## Running

I used bun, but you can also use node. The entry file is `index.mjs`. Other files are there for supporting the exporting feature. Once the raw JSON data is fetched, `cleanData` will convert it to whatever text format you want.

Environment variables are needed, specifically

- `DUOLINGO_TOKEN` your auth token
- `DUOLINGO_COOKIE` your cookie
- `DUOLINGO_ALPHABET_PATH_PROGRESS_KEY` the alphabet path progress key, which otherwise it won't give you the `LOCKED` status for which characters. If you have any ideas on how to reverse engineer this, let me know.

```sh
bun run ./duolingo-scraper/index.mjs
```

```sh
node ./duolingo-scraper/index.mjs
```

## Future Endeavors

In the future, I want to show practice sentences for each word and I have to come up with my own to check understanding.

Also, another deck with pictures.
