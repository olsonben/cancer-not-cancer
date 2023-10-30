# Client
(As of 27 October 2023)

## Table of Contents
1. [Setup](#setup)
2. [Pages](#pages)
    1. [Home](#home)
    2. [Pathapp](#pages-pathapp)
    3. [Login](#login)
    4. [Admin](#pages-admin)
3. Components (Coming Soon)

## Setup

```bash
# install node modules
npm install
```

Next, duplicate **.env.bk** as **.env.development** for a development environment. Then populate the fields to resemble your setup. For example when running the app in development mode **API_URL** might look like below.
```bash
# .env.development
...
API_URL='http://localhost:3333/'
...
```
When setting up staging or production sites, duplicate **.env.bk** as **.env.staging** and **.env.production** respectively.

## Start Server
**Development Mode**
In dev mode, the site will watch files for changes and refresh/relaunch the site to show updates.
```bash
npm run dev
```
**Production & Staging Mode**
Thanks to nuxt.js we can build the frontend client into a static site. Then a server can serve the static site with nginx or any other web serving software. We should also be able to put the site on a CDN.

***Production:*** `npm run css-build && npm run build && npm run generate` - This will create a **dist** folder inside the **client** folder. You can copy this to your production location or you can symlink that folder to have it update automatically.

***Staging:*** The same instructions from production work for staging with the following command:
`npm run css-build && npm run build-stage && npm run gen-stage`


## Pages

This section describes the general purpose of each page.

### Home

This is the home page for the client.

### <a id='pages-pathapp'></a>Pathapp (CancerNotCancer)

This is the core page of the app and allows pathologists to see assigned tasks and make evaluations on the associated images and prompts. When a pathologist evaluates all the images associated with a task, '*No more images available in this task.*' will be presented, and another prompt/task should be chosen.

At the top of the page is the task/prompt selector. Images to evaluate will be directly below the selected prompt. Under the image are three buttons to grade the image labeled "No", "Maybe", and "Yes". Under the buttons is a text field for the pathologist to optionally leave a comment on that grading. You can also swipe right-to-left (No) or left-to-right (Yes) to grade an image (swiping bottom-to-top will bring up the comment box). The grading will go through to the api and be recorded upon grading the image (pressing a button or swiping) and a new image will be displayed to repeat the process again.

### Login

This is the login page. The login component is utilized over this page, but this page does represent a permenant url for logging in. The login component resembles the login page, but is designed as a modal to overlay any page in the app that needs credentials to access. You can select from one of the following methods of authentication:

- Google

### <a id='pages-admin'></a>Admin

This is for adding images, users, and tasks, each type in separate tabs. There is also a stats tab for viewing data with regards to the rating of tasks(sets of images with a certain prompt).

- **Images** - This tab allows the management of images.
    - Upload images - The Upload Folders tab allows the upload of groups of photos and the folder structure from the file system will be preserved. The Upload Files tab can be used for uploading individual groups of files.
    - Image Manager - Allows for the management of uploaded files. Files can be dragged to new folders, folders can be dragged into other folders, files and folders can be renamed, and new folders(tags) can be created. 
    ***Note:** The movement and renaming of files and folders does not change an images association with a task, **BUT** deleting a file will delete it from any task it is associated with.*

- **Users** - Allows the creation of new users in the system. The email used has to be unique and a valid Google Workspace email (either a gmail or an email powered by Google, like @milmed.ai). The password field should be left blank as we are not currently using passwords for authentication.
    - **Is Enabled:** Is the account usable. This permission allows system admins to disable an account without deleteing it.
    - **Is Uploader:** Is the user allowed to upload images and create new tasks. You can also think of this permission as whether the users is an Investigator or not.
    - **Is Pathologist:** Can the user make a grading/rating on images. Even with this permission set to true, an uploader/investigator still needs to assign them to a task.
    - **Is Admin:** Is the user an admin. Admins can create new users.

- **Tasks** - This tab allows the creation and management of tasks. A task can be thought of as a collection of images with an associated prompt. Once a task is created it is added to the existing tasks table where the investigator can add images and assign observers(pathologists) to the tasks by clicking the edit button. 
***Note:** Deleting tasks doesn't delete ratings made on an images or delete the images associated with the task, but the image will no longer be associated with that specific prompt. Currently, it would be hard to reconstruct data after a task is deleted as only the old task id would remain.*

- **Stats** - Allows the viewing of tasks stats. You can view the aggregate stats of all your tasks, or choose a specific task that you would like to see the stats of. If you are an admin, you can see other investigators stats.

## Components - Coming Soon

### Adder.vue
### File.vue
### Folder.vue
### ImageManager.vue
### ImagePicker.vue
### Login.vue
### NavBar.vue
### Row.vue
### Table.vue
### TaskEdit.vue
### Userview.vue

## Structure

```bash
.
├── .nuxt                          # nuxtjs (Don't touch)					
├── assets                         # styles, images, and fonts (typically)
│   ├── css
│   │   └── main.css                # built (Don't touch)
│   ├── fonts
│   │   ├── cnc-icons.svg           # custom icon font
│   │   ├── cnc-icons.ttf           # custom icon font
│   │   └── cnc-icons.woff          # custom icon font
│   ├── icons                      # standalone versions of icons
│   │   ├── arrow-set.svg           # used for swipe hinting on mobile
│   │   ├── label-tag.svg           # task name icon
│   │   ├── pen-to-square.svg       # general edit icon
│   │   ├── pencil.svg              # comment icon when evaluating images
│   │   ├── question.svg            # prompt icon
│   │   ├── tag.svg                 # tag icon, not currently used
│   │   ├── tags.svg                # tags icon, not currently used
│   │   ├── trash-can-solid.svg     # inverted trash-can icon, not currently used
│   │   ├── trash-can.svg           # delete icon (tasks)
│   │   └── xmark.svg               # x icon, file delete icon currently
│   ├── scss                       # sass style sheets, compiled into main.css
│   │   ├── colors.scss             # color and theme variables
│   │   ├── font-icon.scss          # part of making the cnc icon font
│   │   ├── main.scss               # primary custom styles for the app
│   │   └── variables.scss          # any numerical css values and sass mixins
│   └── logo.svg                    # site logo
├── components
│   ├── Adder.vue                   # For adding observers to a task
│   ├── File.vue                    # Represents an image in the image picker and manager
│   ├── Folder.vue                  # Represents a folder/tag in the picker and manager
│   ├── ImageManager.vue            # Allows the deletion, renaming, and moving of images
│   ├── ImagePicker.vue             # For selecting images for a task
│   ├── Login.vue                   # Modal that appears over pages that require auth
│   ├── NavBar.vue                  # To navigation bar to the application
│   ├── Row.vue                     # Table row, used in data and task tables
│   ├── Table.vue                   # Used in the data/stats view
│   ├── TaskEdit.vue                # Allows prompt editing, adding observers, and picking images
│   └── Userview.vue                # Dropdown for admins to switch the perspective account
├── layouts
│   └── default.vue                 # Main app layout
├── middleware
│   ├── auth.js                     # Old auth check that would redirect (not used)
│   └── authError.js                # Catch authentication errors...
├── pages                          # main application pages
│   ├── about.vue                   # simple about page
│   ├── admin                       # Tabs within admin.vue
│   │   ├── dataview.vue             # See the stats of all or a selected task
│   │   ├── images.vue               # Upload and managed image files
│   │   ├── tasks.vue                # Create and manage tasks(prompts)
│   │   └── users.vue                # Create new users (admin only)
│   ├── admin.vue                   # All advance user tools
│   ├── index.vue                   # Home page
│   ├── issues.vue                  # Place to file an issue
│   ├── login.vue                   # Dedicated login page
│   ├── logout.vue                  # This page automatically logs a user out
│   └── pathapp.vue                 # Where image evaluation happens
├── plugins
│   ├── common.js                   # function used across multiple components
│   └── draggable.js                # Allows elements to become draggable and tranfer data
├── static                         # static assest used throughout the site
│   ├── android-chrome-192x192.png  
│   ├── android-chrome-512x512.png  
│   ├── apple-touch-icon.png        
│   ├── browserconfig.xml           
│   ├── favicon-16x16.png           
│   ├── favicon-32x32.png           
│   ├── favicon.ico                 
│   ├── logo.svg                    
│   ├── mstile-144x144.png          
│   ├── mstile-150x150.png          
│   ├── mstile-310x150.png          
│   ├── mstile-310x310.png          
│   ├── mstile-70x70.png            
│   ├── safari-pinned-tab.svg       
│   └── site.webmanifest            
├── store                          # Data 'store' accessible by all components
│   └── user.js                     # Manages the users logged state and permissions
├── .env.bk                         # Backup of generic .env settings
├── .env.development                # Development environmental variables
├── .env.production                 # Production environmental variables
├── .env.staging                    # Staging environmental variables
├── nuxt.config.js                  # All nuxtjs app settings
├── package-lock.json
├── package.json
└── README.md                       # Your looking at it!
```