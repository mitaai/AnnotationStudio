# Getting started
## Clone the project
First, clone the project locally and move into the folder. To do this, open your terminal and run:
```sh
git clone https://github.com/mitaai/AnnotationStudio.git
cd AnnotationStudio
```

## Install Node.js
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

## Install MongoDB
In order to run the DB server locally, you will need to install MongoDB. This can be done using any package manager—we use [homebrew for MacOS](https://brew.sh/). For other operating systems, see the [MongoDB documentation](https://docs.mongodb.com/manual/installation) (community edition).

With homebrew on MacOS:
```sh
brew install mongodb-community
```

Once the install has completed, run this command to start the server daemon:
```sh
brew services start mongodb-community
```

## Install project dependencies
Next, install the project's dependencies using npm.
```sh
npm install
```

## Environment variables
Set up environment variables in a new file called `.env.local`. You can copy the sample `.env.local.sample` and fill in the values received from team members, or use your own values. You will need to provide details for an email server; in our case we use Papertrail. The auth secret should be kept secret between team members and never exposed publicly.

## Seed database
To seed the database with test data, run the following command:
```sh
npm seed
```
This command assumes your database name is `as4`. If that is not the case, prepend the command with `DBNAME=yourdbname`.

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

# Quality management
## Code style
We use [ESLint](https://eslint.org/) to lint the JavaScript code, thus making sure that we avoid syntax errors and that the code style remains consistent throughout the project. ESLint can be configured to adapt to any team's taste. We use [Airbnb's preset](https://www.npmjs.com/package/eslint-config-airbnb).

ESLint can be integrated with most common text editors, so that you can immediately see errors in your code without running any shell scripts. If you are using VSCode, you can use the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). If you are using Atom, navigate to the [linter-eslint](https://atom.io/packages/linter-eslint) extension and click the Install button.

The ESLint configuration can be changed int the `.eslintrc` file. The file `.eslintignore` can be used to ignore files that aren't owned by the project or shouldn't be linted. 

#### `npm run lint`
Runs ESLint in the `src` folder and fixes all errors that can be fixed automatically.

#### `npm run lint-latest`
Runs ESLint on all JavaScript and JSON files that changed since the last commit.

## Unit testing
We use unit testing to make sure our components' functionality is working as expected, thus avoiding the creation of new bugs. Testing also serves as a self documentation, as tests describe really well the purpose of the code.

Unit testing is done using [Jest](https://jestjs.io/). Jest can be configured within the `jest.config.js` file in the project's root.

### Naming tests
Unit tests are named after the file they test. For example, if we need to test the file `dateUtil.js`, we would create a new file next to it called `dateUtil.test.js`. Jest would then automatically recognize and run it.

Tests that involve multiple components' interactions, also known as integration tests, should be placed in the `__tests__` directory.

### Testing React components
We use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) to test React components. An example test using React Testing Library can be found in [this Next.js example](https://github.com/vercel/next.js/blob/canary/examples/with-jest/__tests__/testing-library.js).

### Running tests
#### `npm run test`
Runs the tests in interactive mode. Useful when developing. Runs by default only on files changed since the last commit, but all tests can be run at any time by typing `a` in the interactive test mode.

#### `npm run test-latest`
This command is the equivalent of `npm run test`, but doesn't run in interactive mode and only the tests related to the files changed since the last commit are tested.

***

This README was adapted from [hyperstudio/hidden-perspectives-app](https://github.com/hyperstudio/hidden-perspectives-app/blob/master/README.md).