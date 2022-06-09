# Client
(As of 30 May 2022)

# Table of Contents
1. [Pages](#pages)
    1. [Admin](#pages-admin)
    2. [Pathapp](#pages-pathapp)
    3. [Home](#home)
    4. [Login](#ages-login)
2. [Usage](#usage)
    1. [Admin](#usage-admin)
    2. [Pathapp](#usage-pathapp)

# Pages

This section describes the general purpose of each page. For detailed explanations, see [Usage](#usage).

## <a name='pages-admin'></a>Admin

This is for adding images and users, each type in seperate tabs.

## <a name='pages-pathapp'></a>Pathapp

This is for grading hot-or-nots on images.

## Home

This is the home page for the client.

## Login

This is the login page. You can select from one of the following methods of authentication:

- Google

# Usage

## <a name='usage-admin'></a>Admin

### Images

For uploading images. Click the `Choose Files` button to open a pop-up window to your filesystem. You will only be permitted to choose image files. You can choose multiple images by dragging the mouse over the images or by holding `shift` or `control` and clicking on individual images.

## <a name='usage-pathapp'></a>Pathapp

For grading hot-or-nots. At the top of the page is the image to grade. Under the image is a text field for the pathologist to optionally leave a comment on that grading. Under the comment field is three buttons to grade the image as simply cancer, not cancer, or possibly cancer (labeled "Yes Cancer", "No Cancer", and "Maybe Cancer" respectfully). The grading will go through to the api and be recorded upon grading the image (pressing a button) and a new image will be selected and displayed to repeat the process again.