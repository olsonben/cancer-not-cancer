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
    - [/auth/success]
    - [/auth/failure]
    - [/auth/logout]
    - [/auth/google]
        - [/auth/google/callback]

### /nextImage

Randomly select the next image to display. Returns path to the image.

Example return: `"https://api.milmed.ai/images/bridge.jpeg"`.

### /auth

Base page for authorization and where you can login. Protected pages are rerouted here for authorization.

Current methods of authorization:
- Google

### /auth/success

Redirection route for successful authorization.

#### /auth/failure

Page to show when authorization fails.

### /auth/logout

Logout of the session. The session will automatically logout after enough time but this is instantaneous and cleaner than deleting the cookie.

#### /auth/google

Authorize with Google

##### /auth/google/callback

Callback for authorizing with google

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
    email: "mar.doe@gmail.com",
    password: "i_like2DB",
    permissions: {
        enabled: 1,
        uploader: 1,
        pathologist: 1,
        admin: 1
    }
}
```

The values to `permissions` fields MUST be either `1` or `0`, this is strongly compared (`===`).

Note that email is a unique key for users.

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