# Welcome to Cancer Not Cancer

~~A simple webapp to label uncertain ai images.~~
A great project covering a surprising amount of web basics. Incidentally, it also is useful for hand-labelling uncertain AI images.

# Table of Contents

1. [Set Up](#set-up)
2. [Usage](#usage)
    1. [Client]](#client)
    2. [API](#api)
3. [TODO](#todo)
4. [Discuss](#discuss)

# Set Up

1. Run `cd BackEnd && npm install && npm run dev` to install packages and start the server.
2. In a new terminal window, run `cd FrontEnd && npm install && npm run dev` to install packages and start the client.

# Usage

(As of 30 May 2022)

## [Client](client/README.md)

This is the UI for the API. This is a good place to look if you have confusion using the api.

## [API](api/README.md)

This is what handles all the data. Storing and logging images and hotornots as well as adding users and logging in is all done through the api. Note that most calls will require prior authorization to access.

# TODO

1. Set up index page
2. Seperate frontend (pathapp.milmed.ai) from backend (api.milmed.ai)

## Urgent

1. Get client pages locked under authorization

# Discuss

1. How to choose the next image?