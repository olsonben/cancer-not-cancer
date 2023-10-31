# Welcome to Cancer Not Cancer

A web application that allows investigating pathologists to assign fellow pathologists hand-labeling tasks on slide images. Produced ratings can then be used to train computers with machine learing to classify such slide images.

# Set Up

1. [API/Backend setup and operation](api/README.md#api---server)
2. [Client/Frontend setup and operation](Client/README.md#client)

# Usage

(As of 30 October 2023)

## [Client](client/README.md)

This is the UI for the API. This is a good place to look if you have confusion using the api.

## [API](api/README.md)

This is what handles all the data. Storing and logging images and hotornots as well as adding users and logging in is all done through the api. Note that most calls will require prior authorization to access.

# TODO

1. Update tools.

## FUTURE
1. Skip button
2. History toggle (limit 10 grades with show more)