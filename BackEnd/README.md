# BackEnd

## Setup

```bash
$ npm install
$ <NOTE: ask Elaine how she set up the DB>
```

## HTTP Requests

All requests must pass the credentialling of `isValid` (see `HELPER FUNCTIONS` of `app.js`).

### GET

- [nextImage](#nextImage)

#### nextImage

Randomly select the next image to display. Returns static path to the image.

Example return: `"https://static.milmed.ai/images/bridge.jpeg"`.

### POST

- [archive](#archive)
- [users](#users)
- [images](#images)

#### archive

Archive responses from the pathologist. Only pathologists can archive.

Example request body:
```json
{
    id: 1,
    rating: 0,
    comment: "I like to comment.",
    user: "mar",
}
```

#### users

Add a user. Only admins can add users.

Example request body:
```json
{
    credentials: <idk>
    fullname: "Maria Doe",
    username: "mar",
    password: "i_like2DB",
    is_pathologies: true
}
```

Note that username is a unique key for users.

#### images

Add an image. Anyone can add an image.

```json
{
    credentials: <idk>
    path: "/images/bridge.jpeg",
    hash: NULL,
    user: "mar"
}
```

Note that `path` should be the local path to the location of the image on the server (ie. accessible by `"https://static.milmed.ai" + path`).

## Keys for `ratings`

Keys generally follow the pattern of `-` for "not"-ness while the absolute value of the rating refers to the specific diagnosis. 

| Rating |  Meaning   |
|:------:|:----------:|
| -1     | Not Cancer |
| 0      | Unsure     |
| 1      | Cancer     |