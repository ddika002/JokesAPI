const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database('joke.db'); // Use a file-based SQLite database

app.use(bodyParser.json());

// Create tables and seed initial data
// Create SQLite database file


// Create Jokes table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Jokes (
        id INTEGER PRIMARY KEY,
        text TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        dislikes INTEGER DEFAULT 0
    )`);

    // Create Categories table
    db.run(`CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    )`);

    // Create Joke_Categories table
    db.run(`CREATE TABLE IF NOT EXISTS Joke_Categories (
        joke_id INTEGER,
        category_id INTEGER,
        PRIMARY KEY (joke_id, category_id),
        FOREIGN KEY (joke_id) REFERENCES Jokes(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
    )`);

    // Create Votes table
    db.run(`CREATE TABLE IF NOT EXISTS Votes (
        id INTEGER PRIMARY KEY,
        joke_id INTEGER,
        type TEXT CHECK(type IN ('like', 'dislike')),
        FOREIGN KEY (joke_id) REFERENCES Jokes(id) ON DELETE CASCADE
    )`);
});


// Retrieve a random joke from all jokes in the database
app.get('/jokes/random', (req, res) => {
  db.get('SELECT * FROM jokes ORDER BY RANDOM() LIMIT 1', (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(row);
    }
  });
});

// Retrieve a random joke from a category of jokes
app.get('/jokes/random/:category', (req, res) => {
  const category = req.params.category;
  const query = 'SELECT jokes.* FROM jokes ' +
                'JOIN joke_categories ON jokes.id = joke_categories.joke_id ' +
                'JOIN categories ON joke_categories.category_id = categories.id ' +
                'WHERE categories.name = ? ' +
                'ORDER BY RANDOM() LIMIT 1';

  db.get(query, [category], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(row);
    }
  });
});

// Retrieve a list of categories
app.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

// Retrieve all jokes for a category
app.get('/jokes/:category', (req, res) => {
  const category = req.params.category;
  const query = 'SELECT jokes.* FROM jokes ' +
                'JOIN joke_categories ON jokes.id = joke_categories.joke_id ' +
                'JOIN categories ON joke_categories.category_id = categories.id ' +
                'WHERE categories.name = ?';

  db.all(query, [category], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

// Retrieve a joke by id
app.get('/joke/:id', (req, res) => {
  const id = req.params.id;
  console.log('Requested Joke ID:', id);

  db.get('SELECT * FROM jokes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!row) {
      console.log('Joke not found');
      res.status(404).json({ error: 'Joke not found' });
    } else {
      console.log('Retrieved Joke:', row);
      res.json(row);
    }
  });
});




// Add a new category of jokes
app.post('/api/categories', (req, res) => {
  const { name } = req.body;

  if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
  }

  db.run('INSERT INTO Categories (name) VALUES (?)', [name], function(err) {
      if (err) {
          return res.status(500).json({ error: 'Failed to add category' });
      }
      res.status(201).json({ id: this.lastID, name: name });
  });
});

// Add a new joke to a category
app.post('/jokes/:category', (req, res) => {
  const category = req.params.category;
  const text = req.body.text;

  // First, insert the new joke into the 'jokes' table
  db.run('INSERT INTO jokes (text) VALUES (?)', [text], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const jokeId = this.lastID;

    // Next, retrieve the category ID based on the category name
    db.get('SELECT id FROM categories WHERE name = ?', [category], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const categoryId = row.id;

      // Finally, insert the joke and category relationship into the 'joke_categories' table
      db.run('INSERT INTO joke_categories (joke_id, category_id) VALUES (?, ?)', [jokeId, categoryId], (err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({ id: jokeId, text: text, category: category });
      });
    });
  });
});

// Add an existing joke to a category by joke id
app.post('/jokes/:id/categories/:category', (req, res) => {
  const jokeId = req.params.id;
  const category = req.params.category;

  console.log('Adding joke to category:', jokeId, category);

  // Check if the joke already belongs to the category
  db.get('SELECT * FROM joke_categories WHERE joke_id = ? AND category_id = (SELECT id FROM categories WHERE name = ?)', [jokeId, category], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (row) {
      console.log('Joke already belongs to the category');
      return res.status(400).json({ error: 'Joke already belongs to the category' });
    }

    // If the combination doesn't exist, insert it into the 'joke_categories' table
    const insertQuery = 'INSERT INTO joke_categories (joke_id, category_id) VALUES (?, (SELECT id FROM categories WHERE name = ?))';
    console.log('Insert query:', insertQuery);
    console.log('Insert data:', jokeId, category);

    db.run(insertQuery, [jokeId, category], (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log('Joke added to category successfully');
        res.json({ joke_id: jokeId, category: category });
      }
    });
  });
});

// Give a joke (by id) a vote of like or dislike
app.post('/api/jokes/:id/vote', (req, res) => {
  const jokeId = req.params.id;
  const { type } = req.body;

  if (!type || (type !== 'like' && type !== 'dislike')) {
      return res.status(400).json({ error: 'Invalid vote type. Must be either "like" or "dislike"' });
  }

  // Update the likes/dislikes count for the joke based on the vote type
  db.run(`UPDATE Jokes SET ${type}s = ${type}s + 1 WHERE id = ?`, [jokeId], function(err) {
      if (err) {
          return res.status(500).json({ error: 'Failed to vote for the joke' });
      }

      // Check if the joke was found and updated
      if (this.changes === 0) {
          return res.status(404).json({ error: 'Joke not found' });
      }

      res.status(200).json({ message: `Successfully voted ${type} for joke ${jokeId}` });
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
