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
2. Run `cd ../BackEnd && npm install && npm run dev` to install packages and start the client.

# Usage
(As of 12 Apr)

## Front End
Pressing the buttons will send the pathologist's response to the server; you can write a comment in the given box before clicking a button. After the response if recorded, the next image is gotten from the server and displayed to the pathologist.

## Back End
You can get images and post the pathologist's response

### GET
1. `'/images/:id'` -- get the specific image at the id
2. `'/nextImage'` -- get the next image to be tested. This sends back the url to the image (see 1)

`'/images/:id'` can easily get a specific image if you already know the id of said image. Note: this id is different from the id stored in `archive.json` and should include the `.jpeg` extension.

`'/nextImage'` will get the next image, which is randomly selected from the list of images to check; this response contains the full url of the image. For example, `GET http://localhost:5050/nextImage` will meet a response of the form `this.imageURL = response.data === 'http://localhost:5050/images/bridge.jpeg`. The response is the full url so it can easily be given to an `<img :src='this.imageURL'>` tag

### POST
1. `'/postData'` -- data should be in JSON format

`'/postData'` will record the pathologist's history into a JSON file (specifically, `archive.json`)

# TODO
1. Set up MariaDB server in DigitalOcean. (wtf do I need to do for this? I am thoroughly unprepared on how this should be done.)

# Discuss
1. Should I have seperate READMEs for the back and front ends?
