const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(express.json());

// Pull database credentials securely from ambient container environment variables
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '27017';

const url = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}`;
let dbClient;

async function initDb() {
  try {
    dbClient = new MongoClient(url);
    await dbClient.connect();
    console.log("Successfully connected to production database engine.");
  } catch (err) {
    console.error("Database initial connection failed:", err.message);
  }
}

// Standard business route
app.post('/transactions', async (req, res) => {
  try {
    const db = dbClient.db('finance');
    const result = await db.collection('log').insertOne({
      amount: req.body.amount,
      type: req.body.type,
      timestamp: new Date()
    });
    res.status(201).send({ status: "Success", transactionId: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: "Failed to log transaction data." });
  }
});

// Health Probes Routes
app.get('/healthz', (req, res) => {
  // Liveness probe: checks if the process is completely frozen or locked up
  res.status(200).send("Alive");
});

app.get('/ready', async (req, res) => {
  // Readiness probe: verifies if the database link is actively handling traffic
  if (dbClient) {
    res.status(200).send("Ready");
  } else {
    res.status(503).send("Database connection not ready.");
  }
});

app.listen(port, () => {
  console.log(`Backend processing engine active on port ${port}`);
  initDb();
});