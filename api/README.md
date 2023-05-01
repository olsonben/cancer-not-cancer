# API
(As of 30 May 2022)

# Setup

```bash
$ npm install
$ <NOTE: ask Elaine how she set up the DB>
```

Fill in `.env.local.js.bk` with the relavant values and rename the file to `.env.local.js`.
Change values in `.env.js` according to your own website.

# HTTP Requests

All requests must pass the credentialling of `isValid` (see `lib/functions.js`). It is recommended to reroute to a login page which links to `/auth` (or one of the authentication method subroutes `-`) for any request requiring authentication (indicated with an `*`). This routing can be checked with the following code snippet wherever you catch errors from the request:

```js
if (error.response.status === 401) window.location.replace(`api.example.com/login`)
```
or use the nuxt router
```js
f (error.response.status === 401) this.$router.push('/login')
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

- [/nextImage `*`](#nextImage-)
- [/isLoggedIn](#isLoggedIn)
- [/auth (deprecated)](#auth-(deprecated))
    - [/auth/success](#authsuccess)
    - [/auth/failure](#authfailure)
    - [/auth/logout](#authlogout)
    - [/auth/google `-`](#authgoogle--)
        - [/auth/google/callback](#authgooglecallback)

### /nextImage `*`

Randomly select the next image to display. Returns path to the image.

Example return: `"https://api.milmed.ai/images/bridge.jpeg"`.

### /isLoggedIn

Checks whether or not the user has been authenticated. Sends the user (see `lib/auth.js deserializeUser`) if they are logged in and `401` with a link to `/auth` if not.

### /auth (deprecated)

> Deprecated:
> It is recommended to link directly to each methods subroute

Basic page for authentication and where you can login. Protected pages are rerouted here for authentication.

Current methods of authentication:

- Google

### /auth/success

Redirection route for successful authentication. Users that authenticate correctly but are not allowed by the user database also go through here but are redirected to origin with a `403` status code. 

#### /auth/failure

Page to show when authentication has an error.

### /auth/logout

Logout of the session. The session will automatically logout after enough time but this is instantaneous and cleaner than deleting the cookie.

#### /auth/google `-`

Authorize with Google

##### /auth/google/callback

Callback for authorizing with google

## POST

- [/hotornot `*`](#hotornot-)
- [/users `*`](#users-)
- [/images `*`](#images-)

### /hotornot `*`

Archive responses from the pathologist.

Example request body:
```js
{
    id: 1,
    rating: 0,
    comment: "I like to comment."
}
```

### /users `*`

Add a user.

Example request body:
```js
{
    fullname: "Maria Doe",
    email: "mar.doe@gmail.com",
    password: "i_like2DB",
    permissions: {
        enabled: true,
        uploader: 1,
        pathologist: true,
        admin: 1
    }
}
```

The values to `permissions` fields should be truthy.

Note that email is a unique key for users. If a duplicate email is supplied, the server will respond with `409` and the message `"Email already exists in database."` as well as the submitted user.

### /images `*`

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

You can upload folders for images by placing the filepath in the name of the file (only works with JS):
```js
const data = new FormData()
data.append('files', this.files)
this.files.forEach(file => {
    data.append('files', file, file.webkitRelativePath === '' ? file.name : file.webkitRelativePath) /* important */
});
axios.post(env.url.api + '/images', data)
```

```html
<form method="post" enctype="multipart/form-data" action='/images'>
    <input type="file" name="files" accept="image/*" multiple webkitdirectory/> <!-- `webkitdirectory` attribute allows submission of folders -->
    <input type="submit" value="Submit" />
</form>
```

# Keys

## Rating

Keys generally follow the pattern of `-` for "not"-ness while the absolute value of the rating refers to the specific diagnosis. 

| Rating |  Meaning   |
|:------:|:----------:|
| -1     | Not Cancer |
| 0      | Unsure     |
| 1      | Yes Cancer |

## Permissions

| Permission     |  Allows           |
|:--------------:|:-----------------:|
| enabled        | Actions           |
| uploader       | Uploading images  |
| pathologist    | Scoring hotornots |
| admin          | Adding users      |

# Structure

```bash
.
├── database/
│   └── pathapp.sql     # Database setup script
├── images/             # Where images are stored
├── lib/
│   ├── auth.js         # Authentication logic (+ routes)
│   ├── database.js     # Easy import to connect to the db
│   ├── functions.js    # Global functions
│   └── upload.js       # Upload with multer
├── .env.js             # Environment variables (public)
├── .env.local.js       # Environment variables (private)
└── app.js              # Main server
```