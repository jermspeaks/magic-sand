import fs from "node:fs";
import https from "node:https";
import csv from "csv-parser";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import "dotenv/config";

const { TMDB_API_KEY } = process.env;
const BASE_URL = "https://api.themoviedb.org/3";

function getTmdbId(movieTitle) {
  return new Promise((resolve, reject) => {
    const searchUrl = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      movieTitle
    )}`;

    https
      .get(searchUrl, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const jsonData = JSON.parse(data);
          if (jsonData.results && jsonData.results.length > 0) {
            resolve(jsonData.results[0].id);
          } else {
            resolve(null);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function generateTmdbLink(tmdbId) {
  return `https://www.themoviedb.org/movie/${tmdbId}`;
}

function readMoviesFromCsv(filename) {
  return new Promise((resolve, reject) => {
    const movies = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (row) => {
        movies.push(Object.values(row)[0]); // Assuming movie titles are in the first column
      })
      .on("end", () => {
        resolve(movies);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function processMovies(movies) {
  const results = [];
  for (const movie of movies) {
    try {
      const tmdbId = await getTmdbId(movie);
      if (tmdbId) {
        const link = generateTmdbLink(tmdbId);
        results.push({ title: movie, link: link });
      } else {
        results.push({ title: movie, link: "Not found" });
      }
    } catch (err) {
      console.error(`Error processing ${movie}: ${err}`);
      results.push({ title: movie, link: "Error" });
    }
  }
  return results;
}

async function main() {
  const inputFile = "./data/movie_list.csv";
  const outputFile = "./data/movie_tmdb_links.csv";

  try {
    const movies = await readMoviesFromCsv(inputFile);
    const results = await processMovies(movies);

    const csvWriter = createCsvWriter({
      path: outputFile,
      header: [
        { id: "title", title: "Movie Title" },
        { id: "link", title: "TMDB Link" },
      ],
    });

    await csvWriter.writeRecords(results);
    console.log(`TMDB links have been generated and saved to ${outputFile}`);
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

main();
