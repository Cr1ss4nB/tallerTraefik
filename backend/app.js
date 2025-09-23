require("dotenv").config();
const express = require("express");
const os = require("os");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

// Conectar a Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

app.use(express.json());

// Endpoint de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando", host: os.hostname() });
});

// Endpoint de health check
app.get("/health", async (req, res) => {
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    res.status(200).json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  } finally {
    await session.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
