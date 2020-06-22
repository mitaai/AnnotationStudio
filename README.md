# Requirements
## Node.js/npm
We recommend [**nvm**](http://nvm.sh/) (Node Version Manager) for handling Node.js versions. You can install it using cURL:
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
or Wget:
```sh
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Once you have installed nvm, run the following commands from the `AnnotationStudio` directory:
```sh
nvm install
nvm use
```
This should install and use the project's correct node version as defined in the `.nvmrc` file.
[Read more about how to use nvm here](https://github.com/nvm-sh/nvm/blob/master/README.md#usage). 

## MongoDB
In order to run the DB server locally, you will need to install MongoDB. This can be done using any package manager—we use homebrew for MacOS (https://brew.sh/). For other operating systems, see the [MongoDB documentation](https://docs.mongodb.com/manual/installation) (community edition).

With homebrew on MacOS:
```sh
brew install mongodb-community
```

Once the install has completed, run this command to start the server daemon:
```sh
brew services start mongodb-community
```

# Getting started
## Clone the project
First, clone the project locally and move into the folder. To do this, open your terminal and run:
```sh
git clone https://github.com/mitaai/AnnotationStudio.git
cd AnnotationStudio
```

## Install the dependencies
Next, install the project's dependencies using npm.
```sh
npm install
```

## Available scripts
### `npm run dev`
Runs the app in development mode.
Open http://localhost:3000 to view it in the browser.

The page will automatically reload if you make changes to the code.
You will see the build errors and lint warnings in the console.

### `npm run test`
Runs the test watcher in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed.

### `npm run start`
Serves the build on http://localhost:3000. Will only run after `npm run build` has completed successfully.

*** 

This README was adapted from [hyperstudio/hidden-perspectives-app](https://github.com/hyperstudio/hidden-perspectives-app/blob/master/README.md).