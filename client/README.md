# Client
(As of 27 October 2023)

## Table of Contents
1. [Setup](#setup)
2. [Pages](#pages)
    1. [Home](#home)
    2. [Pathapp](#pages-pathapp)
    3. [Login](#login)
    4. [Admin](#pages-admin)
3. [Components](#components)

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

This is the login page. The login component is utilized over this page, but this page does represent a permanent url for logging in. The login component resembles the login page, but is designed as a modal to overlay any page in the app that needs credentials to access. You can select from one of the following methods of authentication:

- Google

### <a id='pages-admin'></a>Admin

This is for adding images, users, and tasks, each type in separate tabs. There is also a stats tab for viewing data with regards to the rating of tasks(sets of images with a certain prompt).

- **Images** - This tab allows the management of images.
    - Upload images - The Upload Folders tab allows the upload of groups of photos and the folder structure from the file system will be preserved. The Upload Files tab can be used for uploading individual groups of files.
    - Image Manager - Allows for the management of uploaded files. Files can be dragged to new folders, folders can be dragged into other folders, files and folders can be renamed, and new folders(tags) can be created. 
    ***Note:** The movement and renaming of files and folders does not change an images association with a task, **BUT** deleting a file will delete it from any task it is associated with.*

- **Users** - Allows the creation of new users in the system. The email used has to be unique and a valid Google Workspace email (either a gmail or an email powered by Google, like @milmed.ai). The password field should be left blank as we are not currently using passwords for authentication.
    - **Is Enabled:** Is the account usable. This permission allows system admins to disable an account without deleting it.
    - **Is Uploader:** Is the user allowed to upload images and create new tasks. You can also think of this permission as whether the users is an Investigator or not.
    - **Is Pathologist:** Can the user make a grading/rating on images. Even with this permission set to true, an uploader/investigator still needs to assign them to a task.
    - **Is Admin:** Is the user an admin. Admins can create new users.

- **Tasks** - This tab allows the creation and management of tasks. A task can be thought of as a collection of images with an associated prompt. Once a task is created it is added to the existing tasks table where the investigator can add images and assign observers(pathologists) to the tasks by clicking the edit button. 
***Note:** Deleting tasks doesn't delete ratings made on an images or delete the images associated with the task, but the image will no longer be associated with that specific prompt. Currently, it would be hard to reconstruct data after a task is deleted as only the old task id would remain.*

- **Stats** - Allows the viewing of tasks stats. You can view the aggregate stats of all your tasks, or choose a specific task that you would like to see the stats of. If you are an admin, you can see other investigators stats.

## Components

### Adder.vue

Originally designed as a way to apply a 'tag', it is currently used to drag and drop observers to a task in the task edit modal view(**TaskEdit.vue**). Data is displayed in either an 'active' or 'available' column, and entries can be dragged to the active column to enable the entry or drag back to the available column to deactivate. When changes are made (ie. A data element is dragged from one column to another) the `@update` event is called. The event passes data to your update handler of choice.

**Usage:**
```html
<Adder :tags="observers" @update="updateObservers" />
```
```js
export default {
    data() {
        return {
            activeTab: 'observers',
            observers: {
                applied: [
                    {
                        "id": 1,
                        "name": "Dude Surfer",
                        "applied": 1
                    },
                    {
                        "id": 4,
                        "name": "Johnny Utah",
                        "applied": 1
                    }
                ],
                available: [
                    {
                        "id": 5,
                        "name": "Sand Crab",
                        "applied": 0
                    }
                ],
            },
        }
    },
    methods: {
        updateObservers(observersData) {
            this.observers.applied = observersData.applied
            this.observers.available = observersData.available
        },
    }
}
```

### File.vue

Used to display image files in the **ImageManager** and the **ImagePicker**. `v-model` is used to tie in data to the file. Additionally, you can add `:editable`, `@change`, and `:parentTagId` information. When used in the ImagePicker all you need is v-model which will tie the image to a selectable input box to check or uncheck. However, in the ImageManager we can edit the name of the image files or even move it to a new folder(also known as a tag). `:editable` is a boolean that defaults to `false`. `:parentTagId` is a number defaulted to `null`. When editable the `@change` event will call when the file is deleted or renamed. Below are examples of the data passed into and out of **File.vue**

**v-model data in:**
```js
{
    id: 13,
    name: 'blood_parasite_1.tiff',
    type: 'img',
    selected: false,
}
```

**Change event data out:**
```js
// on renaming
const changeData = {
                eventType: 'fileName',
                fileId: 24,
                newName: 'cancer_img_361.jpeg'
            }

// on deletion
const changeData = {
                eventType: 'fileDelete',
                fileId: 24
            }
```

### Folder.vue

Used to display file tags which are used to virtually represent folders. We can think of tags as folders that contain other folders and files in the same hierarchical or nest format as a file system. Folders have a recursive way of handling data passed to them, ie. they will create new files and folders as they work down the tree of the nested data. Data and changes to a folder are similar to the **File.vue** component. Below is an example of the data going in and change events.
```js
v-model = {
    id: 0,
    name: 'Master Folder',
    contents: [{
        id: 13,
        name: 'blood_parasite_1.tiff',
        type: 'img',
        selected: false
    }, {
        id: 1,
        name: 'Sub_Folder_A',
        contents: [{
            id: 14,
            name: 'blood_parasite_5.tiff',
            type: 'img',
            selected: true
        }],
        type: 'tag',
    }],
    type: 'tag', // tag == folder
}
```
```js
// change events
const changeData = {
    eventType: 'folderName',
    folderId: 1,
    newName: 'my new folder name'
}

const changeData = {
    eventType: 'folderDelete',
    folderId: 1
}

const changeData = {
    eventType: 'folderMove',
    folderId: 1,
    newParentTagId: 3,
    oldParentTagId: 0
}

const changeData = {
    eventType: 'fileMove',
    fileId: 24,
    newParentTagId: 3,
    oldParentTagId: 1
}
```
*Note: Change events from both **File.vue** and **Folder.vue** are designed to be used closely with their parent components **ImageManager.vue** and **ImagePicker.vue**. This is because the nested nature of the data and the use of `v-model` which requires object references for data change propagations. `v-model` is needed for data handling of `<input type="checkbox">` which are used in the ImagePicker.*

### ImageManager.vue

Allows editing of file and folder(tag) names, moving files and folder, and the deletion of files and folders. To move a file or folder simply drag them to a new folder. It catches changes made to the nested folders and files and handles the api communication for convey the relevant information. Data is pulled automatically from the api endpoint `/task/images` and should have the following format.
```js
[{
    id: 0,
    name: 'Master Folder',
    contents: [{
        id: 13,
        name: 'blood_parasite_1.tiff',
        type: 'img',
        selected: false
    }, {
        id: 1,
        name: 'Sub_Folder_A',
        contents: [{
            id: 14,
            name: 'blood_parasite_5.tiff',
            type: 'img',
            selected: true
        }],
        type: 'tag',
    }],
    type: 'tag', // tag == folder
}]
```
### ImagePicker.vue

Similar to the ImageManager, the ImagePicker requires the same data format, but instead of editing the files and folders, you can select files and folders to associate with the corresponding task. Also, the image picker does not pull its own data. That is done by its parent and the data is pass in via `:files`. This allows vuejs to sync a parent `selected` property with all the checkbox inputs through the usage of `v-model`.

**Usage:**
```html
<ImagePicker :files="root.contents"/>
```
```js
let root = {
    id: 0,
    name: 'root',
    contents: [DATA],
    type: 'tag',
    selected: [],
}
```
*Note: `root.contents` should be an array of folders and files objects that matches the format used in the **ImageManager.vue**.*

### Login.vue

A simple modal that checks the current route path in the application and if the users is not logged in, the modal will present itself. This modal is a simple login check and not a permissions check as that is handled else where in the app and the API. The following routes are watched by the login modal:

```js
const authPaths = ['pathapp', 'admin', 'admin-images', 'admin-users', 'admin-dataview', 'admin-tasks']
```
*Note: paths with forward paths should be converted to hyphens. ex. `'admin/images'` ==> `'admin-images'`*

### NavBar.vue

The navigation bar that is present at the top of the application at all times. Depending on the user's login state and permissions the menu options will change. For instance the admin route is only available to user's that can upload or are admins. ex. `v-if='isUploader || isAdmin'`

### Table.vue

Design to be a generic table template. The component allows for a custom number of columns and rows, all based on the data passed to it through `:tableData`. Data passed is then further divided into rows which are passed to the **Row.vue** component. Currently the table component is only used in the stats view (**dataview.vue**).

**Usage:**
```html
<Table :tableData="tableData" />
```
`:tableData` passed to the table component should have the following format:
```js
const rowData = [{
                '[dataNameA]': dataA,
                '[dataNameC]': dataC,
                '[dataNameB]': `${dataB}%`,
                '[dataNameD]': `${dataD}%`,
                '[dataNameE]': dataE,
            }, {
                ...
            }]

const tableData = {
                columns: ['Name A', 'Name D', 'Name B', 'Name C'],
                order: ['dataNameA', 'dataNameD', 'dataNameB', 'dataNameC'],
                indexProp: 'dataNameE',
                bodyData: rowData,
            }
```
*Note:  Column headers are independent of row data. One of the data elements must be used as an index/key (dataE in this case). Also, data can be excluded and reordered based on the property array `order`.*

### Row.vue

The row component acts as a generic row for any table. The row will loop over the order and append table cells of data passed to it. In the example above in [Table.vue](#tablevue), the `indexProp`, `order` and `bodyData[?]` are passed to the row.

**Usage:**

```html
<Row v-for="row in bodyData" :key="row[indexProp]" :row="row" :order="order"/>
```
Additionally the row component has two exception for data passed. If the property name is `progress`, the cell will insert a progress tag to benefit from [Bulma progress styling](https://bulma.io/documentation/elements/progress/). If the column and order have an `action` column, the row will insert an edit and delete button. Those buttons will call `edit` and `delete` events and pass the rows data to the event handler. We can extend the example above to handle those events:

```html
<Row v-for="row in bodyData" :key="row[indexProp]" :row="row" :order="order" @edit="rowEditHandler" @delete="deleteRowHandler"/>
```

### TaskEdit.vue

Used for editing task, this modal is presented when you click on the edit button in the tasks table. The component allows a user to change the task name, prompt, add and remove observers, and select and deselect presented images. Initial data passed into the task edit component is copy to prevent changes from being apply until the user clicks the save button. Upon clicking the save button, this component will interface with the API to save changes to the task, but will call an `save` event to notify the task table of updates. There is also a `@cancel` event that allows the task table to reset any necessary information.

**Usage:**
```html
<TaskEdit v-if="taskToEdit != null" :task="taskToEdit" @save="saveTaskHandler" @cancel="taskToEdit = null"/>
```

**Data in:**
```js
{
    'id': Number,
    'short_name': String,
    'prompt': String,
    'image_count': Number, // Not used
    'observer_count': Number, // Not used
    'progress': Number // Not used
}
```
**Data passed on save:**
```js
{
    observers: Number,  // Number of observers applied to task
    images: Number      // Number of images select for the task/prompt
}
```
*Note: The task's `short_name` and `prompt` will automatically be updated in the task table as the save action will update the `props` passed in originally.*


### Userview.vue

A simple dropdown list of users. This component is design to be added to a page and allows an admin to change their user perspective in the app, allowing them to view other users data. This is currently only implemented in the stats view (**dataview.vue**). A developer will still have to write logic to utilize the `userId` edibility that this component provides.

**Usage:**
```html
<Userview v-if='this.$store.state.user.permissions.admin' :userId.sync="userId" :label="'Created by:'"/>
```
*Note: `:userId.sync` allows a data property in the current component to sync with the `userId` in the **Userview.vue** component.*

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
│   └── draggable.js                # Allows elements to become draggable and transfer data
├── static                         # static assets used throughout the site
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