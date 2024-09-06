// This approach will create a music release feed using the MusicBrainz API for fetching artist releases.
// We'll use React for the frontend, with a simple form to add/remove artists and display release cards.
// The backend will handle API requests to MusicBrainz and manage the list of artists.

/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [artists, setArtists] = useState([]);
  const [newArtist, setNewArtist] = useState("");
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    fetchArtists();
    fetchReleases();
  }, []);

  const fetchArtists = async () => {
    const response = await fetch("/artists");
    const data = await response.json();
    setArtists(data);
  };

  const fetchReleases = async () => {
    const response = await fetch("/releases");
    const data = await response.json();
    setReleases(data);
  };

  const addArtist = async (e) => {
    e.preventDefault();
    await fetch("/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newArtist }),
    });
    setNewArtist("");
    fetchArtists();
    fetchReleases();
  };

  const removeArtist = async (artist) => {
    await fetch("/artists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: artist }),
    });
    fetchArtists();
    fetchReleases();
  };

  return (
    <div className="container">
      <h1>Music Release Feed</h1>
      <form onSubmit={addArtist} className="artist-form">
        <input
          type="text"
          value={newArtist}
          onChange={(e) => setNewArtist(e.target.value)}
          placeholder="Add new artist"
          required
        />
        <button type="submit">Add</button>
      </form>
      <div className="artist-list">
        <h2>Followed Artists:</h2>
        <ul>
          {artists.map((artist, index) => (
            <li key={index}>
              {artist}
              <button onClick={() => removeArtist(artist)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="release-feed">
        {releases.map((release, index) => (
          <div key={index} className="release-card">
            <img src={release.cover} alt={`${release.album} cover`} />
            <div className="release-info">
              <h3>{release.album}</h3>
              <p>{release.artist}</p>
              <p>Released: {release.releaseDate}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="footer">
        <a
          href={import.meta.url.replace("esm.town", "val.town")}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source
        </a>
      </div>
    </div>
  );
}

function client() {
  createRoot(document.getElementById("root")).render(<App />);
}

if (typeof document !== "undefined") {
  client();
}

async function server(request: Request): Promise<Response> {
  // const { blob } = await import("https://esm.town/v/std/blob");
  const url = new URL(request.url);

  // This needs to be updated to use the artists from the database
  // Same for POST and DELETE
  if (url.pathname === "/artists" && request.method === "GET") {
    const artists = (await blob.getJSON("artists")) || [];
    return new Response(JSON.stringify(artists), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/artists" && request.method === "POST") {
    const { name } = await request.json();
    const artists = (await blob.getJSON("artists")) || [];
    if (!artists.includes(name)) {
      artists.push(name);
      await blob.setJSON("artists", artists);
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/artists" && request.method === "DELETE") {
    const { name } = await request.json();
    let artists = (await blob.getJSON("artists")) || [];
    artists = artists.filter((artist) => artist !== name);
    await blob.setJSON("artists", artists);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/releases") {
    const artists = (await blob.getJSON("artists")) || [];
    const releases = await Promise.all(artists.map(fetchArtistReleases));
    const flatReleases = releases.flat().sort((a, b) => {
      if (a.releaseDate === "Unknown" && b.releaseDate === "Unknown") return 0;
      if (a.releaseDate === "Unknown") return 1;
      if (b.releaseDate === "Unknown") return -1;
      return (
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    });
    const limitedReleases = flatReleases.slice(0, 25);
    return new Response(JSON.stringify(limitedReleases), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    `
    <html>
      <head>
        <title>Music Release Feed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${css}</style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `,
    {
      headers: {
        "content-type": "text/html",
      },
    }
  );
}

async function fetchArtistReleases(artistName: string) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release?query=artist:${encodeURIComponent(
      artistName
    )}&limit=5&fmt=json`
  );
  const data = await response.json();
  return data.releases.map((release) => ({
    artist: artistName,
    album: release.title,
    releaseDate: release.date
      ? new Date(release.date).toISOString().split("T")[0]
      : "Unknown",
    cover: `https://coverartarchive.org/release/${release.id}/front-250`, // This might not always work, but it's a common pattern for MusicBrainz cover art
  }));
}

const css = `
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f4;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
}

.artist-form {
  margin-bottom: 20px;
}

.artist-form input {
  padding: 5px;
  margin-right: 10px;
}

.artist-list ul {
  list-style-type: none;
  padding: 0;
}

.artist-list li {
  margin-bottom: 5px;
}

.artist-list button {
  margin-left: 10px;
}

.release-feed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.release-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.release-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.release-info {
  padding: 15px;
}

.release-info h3 {
  margin: 0 0 10px 0;
}

.release-info p {
  margin: 5px 0;
  color: #666;
}

.footer {
  margin-top: 20px;
  text-align: center;
}

.footer a {
  color: #333;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
`;

export default server;
