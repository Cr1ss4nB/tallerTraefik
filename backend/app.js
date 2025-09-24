require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

app.use(express.json());

// Conexión a Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  { encrypted: "ENCRYPTION_OFF" }
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET -> obtener 10 artworks
app.get("/artworks", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (a:Artwork) RETURN a LIMIT 10");
    const artworks = result.records.map(r => r.get("a").properties);
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// POST -> crear un Artwork
app.post("/artworks", async (req, res) => {
  const session = driver.session();
  try {
    const randomId = Math.floor(Math.random() * 100000).toString();
    await session.run(
      "CREATE (a:Artwork {id: $id, title: $title, year: $year, artist: $artist}) RETURN a",
      {
        id: randomId,
        title: req.body.title || "Obra de prueba",
        year: req.body.year || 2025,
        artist: req.body.artist || "Desconocido"
      }
    );
    res.json({ message: "Artwork creado", id: randomId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
