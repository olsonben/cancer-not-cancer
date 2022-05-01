# Welcome to Cancer Not Cancer
~~A simple webapp to label uncertain ai images.~~
A great project covering a surprising amount of web basics. Incidentally, it also is useful for hand-labelling uncertain AI images.

# Table of Contents
1. [Set Up](#set-up)
2. [Usage](#usage)
    1. [Front End](#front-end)
    2. [Back End](#back-end)
        * [GET](#get)
        * [POST](#post)
3. [TODO](#todo)
4. [Discuss](#discuss)

# Set Up
1. Run `cd BackEnd && npm install && npm run dev` to install packages and start the server.
2. In a new terminal window, run `cd FrontEnd && npm install && npm run dev` to install packages and start the client.

# Usage
(As of 29 Apr 2022)

## Front End
Pressing the buttons will send the pathologist's response to the server; you can write a comment in the given box before clicking a button. After the response if recorded, the next image is gotten from the server and displayed to the pathologist.

## Back End

Moved to `BackEnd/README.md`

# TODO

1. ~~Cleanup client html.~~
2. client_id for inserting images - username/password system (Google OAuth?).
3. Insert users.    :: post request scaffolded
4. Insert images.   :: post request scaffolded
5. UI to insert users and images.

## Urgent
1. Re-route all http calls to api.milmed.ai to https

# Discuss

1. ~~Should I have seperate READMEs for the back and front ends?~~
2. How to choose the next image?
3. Who can add users, images, and archive?
4. How does credentialling work?