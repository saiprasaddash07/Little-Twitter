# Little-Twitter Social-Media Platform

> Twitter clone built with the Nodejs, Expressjs, Socket.io, Pug template and Mongodb as database .

## Features

- Full featured social media website like twitter
- User sign up and login using jwt
- Tweet a new post
- Like,Comment & Retweet features
- Replying to a post and post delete functionality
- User profile management
- User profile image and front page image upload
- Following and followers functionality
- Tweets and replies management functionality
- User ability to search a post or user
- Realtime chatting functionality
- Individual as well as group chat feature
- Realtime notifications functionality

### Env Variables

Create a .env file in then root and add the following

```
NODE_ENV = development
PORT = 5000
MONGO_URI = your mongodb uri
SESSION_SECRET = 'abc123'
```

### Install Dependencies (frontend & backend)

```
npm install
```

### Run

```
# Run frontend & backend (:5000)
npm run start
```

## Build & Deploy

```
# Create project prod build
```

There is a Heroku postbuild script, so if you push to Heroku, no need to build manually for deployment to Heroku

## License

The ISC License

Copyright © Little-Twitter