const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Then your other routes...

app.use(cors());              // Enable CORS
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2003',
  database: 'RegistrationDB'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Users (
      UserID INT AUTO_INCREMENT PRIMARY KEY,
      Username VARCHAR(50) UNIQUE NOT NULL,
      Email VARCHAR(100) UNIQUE NOT NULL,
      Password VARCHAR(255) NOT NULL,
      FullName VARCHAR(100),
      Phone VARCHAR(15),
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(createTableQuery, (err) => {
    if (err) throw err;
    console.log('Users table ready');
  });
});

// Registration endpoint
app.post('/register', (req, res) => {
  const { Username, Email, Password, FullName, Phone } = req.body;
  if (!Username || !Email || !Password) {
    return res.status(400).json({ error: 'Username, Email and Password required' });
  }
  const insertQuery = `INSERT INTO Users (Username, Email, Password, FullName, Phone) VALUES (?, ?, ?, ?, ?)`;
  db.query(insertQuery, [Username, Email, Password, FullName, Phone], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Username or Email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User registered', UserID: result.insertId });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
