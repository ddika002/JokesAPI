This is our high-quality Jokes API. You can use this API to request
and remove different jokes.

### Retrive a Random joke

Retrieve a random joke from all jokes in the database

```endpoint
GET /jokes/random
```

#### Example request

```curl
$ curl http://localhost:5000/jokes/random
```
#### Example response

```json
{
    "category_id": 5,
    "dislikes": 0,
    "id": 6,
    "joke_text": "Why did the biology teacher go to jail? Because she stole the cell's nucleus!",
    "likes": 0
}
```

 ### Retrive a random joke from a category of jokes

Retrieve a random joke from a category of jokes

```endpoint
GET /jokes/random/:category
```

#### Example request

```curl
curl http://localhost:5000/jokes/random/Dad Jokes
```

#### Example response

```json
{
    "category_id": 1,
    "dislikes": 0,
    "id": 2,
    "joke_text": "Want to hear a joke about construction? I'm still working on it.",
    "likes": 0
}
```

 ### Retrive lists of categories

Retrieve  lists of categories from database

```endpoint
GET /categories
```

#### Example request

```curl
curl http://localhost:5000/categories
```

#### Example response

```json
    [
    {
        "id": 1,
        "name": "Dad Jokes"
    },
    {
        "id": 2,
        "name": "Humour Jokes"
    },
    {
        "id": 3,
        "name": "One Liner Jokes"
    },
    {
        "id": 4,
        "name": "Programming "
    },
    {
        "id": 5,
        "name": "Science Joke"
    }
]
```
### Retrieve all jokes for a category 

Retrieve all jokes using category name

```endpoint
GET /jokes/:category
```

#### Example request

```curl
curl http://localhost:5000/jokes/Dad Jokes
```

#### Example response

```json
    [
    {
        "category_id": 1,
        "dislikes": 0,
        "id": 1,
        "joke_text": "Why don't skeletons fight each other? They don't have the guts.",
        "likes": 0
    },
    {
        "category_id": 1,
        "dislikes": 0,
        "id": 2,
        "joke_text": "Want to hear a joke about construction? I'm still working on it.",
        "likes": 0
    },
    {
        "category_id": 1,
        "dislikes": 3,
        "id": 12,
        "joke_text": "I'm reading a book on anti-gravity. It's impossible to put down!",
        "likes": 5
    }
]
```

### Joke by ID

Retrive a joke by ID

```endpoint
GET /joke/:id
```

#### Example request

```curl
curl http://localhost:5000/jokes/5
```

#### Example response

```json
{
    "category_id": 5,
    "dislikes": 0,
    "id": 5,
    "joke_text": "How does a scientist freshen their breath? With experi-mints!",
    "likes": 0
}
```

### Add a new category of joke

 

```endpoint
POST /categories
```

#### Example request

```curl
curl -X POST -H "Content-Type: application/json" -d "{ \"name\": \"Management\" }" http://localhost:5000/categories
```

#### Example request body

```json
{
    "name": "Management"
}
```

#### Example response

```json
{
  "id": 6,
  "message": "Category added successfully"
}
```

### Add a new joke to a category

```endpoint
POST /jokes/:category
```

#### Example request

```curl
curl -X POST -H "Content-Type: application/json" -d "{ \"category\":\"Management\" ,\"joke_text\": \"Management is always a joke.\" }" http://localhost:5000/jokes/Management
```

#### Example request body

```json
{
    "category": "Mangement",
    "joke_text": "Management is always a joke."
}
```

#### Example response

```json
{
  "id": 13,
  "message": "Joke added successfully"
}
```

### Add existing joke to a category by joke id

Add an existing joke to a category by joke id 

```endpoint
POST /joke/:id/category/:category
```

#### Example request

```curl
curl -X POST http://localhost:5000/joke/2/category/Management
```
#### Example request body

```json
{
    "id":2,
    "category": "Management"
    
}
```


#### Example response

```json
{
  "id": 14,
  "message": "Joke copied to new category successfully"
}
```

### Give a like or dislike


```endpoint
POST /joke/:id/:type
```

#### Example request for Like

```curl
curl -X POST http://localhost:5000/joke/5/like
```
#### Example response for like

```json
{
  "message": "Vote recorded successfully for like"
}
```
