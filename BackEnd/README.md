# BackEnd

# Setup

```bash
$ npm install
$ <NOTE: ask Elaine how she set up the DB>
```

Fill in the `.env.js.bk` with the relavant values and rename the file to `.env.js`.

# HTTP Requests

All requests must pass the credentialling of `isValid` (see `HELPER FUNCTIONS` of `app.js`).

## GET

- [/nextImage]
- [/auth]
    - [/auth/failure]
    - [/auth/google]
        - [/auth/google/callback]
- [/logout]
- [/bouncer]

### /nextImage

Randomly select the next image to display. Returns static path to the image.

Example return: `"https://static.milmed.ai/images/bridge.jpeg"`.

### /auth

Base page for authorization and where you can login. Protected pages are rerouted here for authorization.

Current methods of authorization:
- Google

#### /auth/failure

Page to show when authorization fails.

#### /auth/google

Authorize with Google

##### /auth/google/callback

Callback for authorizing with google

### /logout

Logout of the session. The session will automatically logout after enough time but this is instantaneous and cleaner than deleting the cookie.

### /bouncer

Redirects back to the origin after autherntication.

## POST

- [/hotornot]
- [/users]
- [/images]

### /hotornot

Archive responses from the pathologist.

Example request body:
```json
{
    id: 1,
    rating: 0,
    comment: "I like to comment."
}
```

### /users

Add a user.

Example request body:
```json
{
    fullname: "Maria Doe"
    username: "mar.doe@gmail.com",
    password: "i_like2DB",
    is_pathologies: true
}
```

Note that username is a unique key for users.

### /images

Add an image.

```json
{
    path: "/images/bridge.jpeg",
    hash: NULL
}
```

Note that `path` should be the local path to the location of the image on the server (ie. accessible by `"https://static.milmed.ai" + path`).

# Keys for `rating`

Keys generally follow the pattern of `-` for "not"-ness while the absolute value of the rating refers to the specific diagnosis. 

| Rating |  Meaning   |
|:------:|:----------:|
| -1     | Not Cancer |
| 0      | Unsure     |
| 1      | Cancer     |

# Keys for `permissions`

| Permission     |  Allows           |
|:--------------:|:-----------------:|
| is_enabled     | All actions       |
| is_uploader    | Uploading images  |
| is_pathologist | Scoring hotornots |
| is_admin       | Adding users      |