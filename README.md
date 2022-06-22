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

1. Set up home page.
2. Set up login page.
3. ~~Set up new image selection method.~~ :: NOTE does not support multiple pathologists working simultaneously.
4. Seperate frontend (pathapp.milmed.ai) from backend (api.milmed.ai).
5. Update tools.

~~Cookies for login button to dissapear~~ :: NOTE using store; redundantly checks every page change; slow loading of button comes from v-html
Skip button :: Future
History toggle (limit 10 grades with show more) :: Future

## Urgent

1. Get client pages locked under authorization. Does this actually need to happen?

# Discuss

1. Do we want to register a skip in the hotornot table? Should this be handled with mysql or express. Noting a skip is simple, getting the next image with skips is less so. If we want to check out blocks of images, this is simply moving the current image to the end of the list. All of this depends on how skipping works.