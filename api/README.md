# API
(As of 30 May 2022)

# Setup

```bash
$ npm install
$ <NOTE: ask Elaine how she set up the DB>
```

Fill in the `.env.js.bk` with the relavant values and rename the file to `.env.js`.

# HTTP Requests

All requests must pass the credentialling of `isValid` (see `HELPER FUNCTIONS` of `app.js`). It is recommended to reroute to a login page which links to `/auth` for any route requiring authentication (indicated with an `*`). This routing can be checked with the following code snippet wherever you catch errors from POST/GET:

```js
if (error.response.status === 401) window.location.replace(`api.example.com/login`)
```

For example:

```js
axios.get('api.example.com/nextImage')
    .then(response => {
        this.image = response.data
    })
    .catch(error => {
        if (error.response.status === 401) window.location.replace(`api.example.com/login`)
        console.error(error)
    })
```

## GET

- [/nextImage] *
- [/auth]
    - [/auth/success]
    - [/auth/failure]
    - [/auth/logout]
    - [/auth/google]
        - [/auth/google/callback]

### /nextImage *

Randomly select the next image to display. Returns path to the image.

Example return: `"https://api.milmed.ai/images/bridge.jpeg"`.

### /auth

Base page for authorization and where you can login. Protected pages are rerouted here for authorization.

Current methods of authorization:

- Google

### /auth/success

Redirection route for successful authorization. Users that authenticate correctly but are not allowed by the user database also go through here but are redirected to origin with a `403` status code. 

#### /auth/failure

Page to show when authorization has an error.

### /auth/logout

Logout of the session. The session will automatically logout after enough time but this is instantaneous and cleaner than deleting the cookie.

#### /auth/google

Authorize with Google

##### /auth/google/callback

Callback for authorizing with google

## POST

- [/hotornot] *
- [/users] *
- [/images] *

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

The values to `permissions` fields must be either `1` or `0`, this is strongly compared (`===`).

Note that email is a unique key for users.

### /images

Add an image. The request must include `multipart/form-data` or the image uploading will not work, the server will responde with status code `415` if this is not set. The api will safely handle all requests to ensure only images (specifically images of type `png`, `jpg`, or `jpeg`) are uploaded.

Using plain html, the form should resemble this:
```html
<form method="post" enctype="multipart/form-data" action='/images'>
    <input type="file" name="files" accept="image/*" multiple/> <!-- Note: multiple is optional to allow multiple image uploads -->
    <input type="submit" value="Submit" />
</form>
```

Using `axios` you can use `import FormData from form-data`:
```js
const data = new FormData()
data.append('files', this.files)            // Add the files array object
this.files.forEach(file => {
    data.append('files', file, file.name)   // put each file into the files array in the form
});
axios.post(env.url.api + '/images', data)
```

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