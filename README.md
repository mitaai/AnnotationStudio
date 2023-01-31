# Annotation Studio

Web application for collaborative annotation

### Contents

- [Getting started](#getting-started)
  * [Clone the project](#clone-the-project)
  * [Install Node.js](#install-nodejs)
  * [Install MongoDB](#install-mongodb)
  * [Install project dependencies](#install-project-dependencies)
  * [Environment variables](#environment-variables)
  * [Available scripts](#available-scripts)
- [Quality management](#quality-management)
  * [Code style](#code-style)
  * [Unit testing](#unit-testing)
- [Deployment](#deployment)
  * [To AWS via Severless and GitHub Workflows](#to-aws-via-severless-and-github-workflows)
  * [To Vercel](#to-vercel)

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

You may also use a hosted MongoDB instance. Please see the section on environment variables below in order to link your DB.

## Install project dependencies
Next, install the project's dependencies using npm.
```sh
npm install
```

## Environment variables
Set up environment variables in a new file called `.env.local`. You can copy the sample `.env.local.sample` and fill in the values received from team members, or use your own values. You will need to provide details for an email server; in our case we use Papertrail. The auth secret should be kept secret between team members and never exposed publicly.

The `ADMIN_EMAIL` variable sets the initial admin user. If you are installing Annotation Studio, this should be the email address you intend to use on sign up. That will give you access to the admin interface. If you do not set this variable before installing Annotation Studio and signing up for an account, you will need to manually set your user `role` to `"admin"` in the MongoDB shell.

<details>
  <summary>Manually set role</summary>

  If you signed up without setting the `ADMIN_EMAIL` environment variable, you can enter the MongoDB shell and manually set your role.

  The following assumes your database name is `as4` and your email address is `my@email.com`.

  ```sh
  $ mongo
  ```
  ```sh
  > use as4
  > db.users.updateOne({ 'email':'my@email.com' },{ $set: { 'role':'admin' } })
  ```
</details>

The `MONGODB_URI` and `DB_NAME` relate to your MongoDB instance. The values in `env.local.sample` assume a locally-hosted DB, but it is entirely possible to use an external one. Just make sure you set the `MONGODB_URI` to the MongoDB connection string. __Note:__ `MONGODB_URI` should include the DB name at the end of the connection string. This must match the value entered in `DB_NAME`.

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

***

# Deployment

## To AWS via Severless and GitHub Workflows

This project is deployed to AWS CloudFront/S3/Lambda using the [Serverless Framework](https://www.serverless.com/) and GitHub Workflows. 

### Configuration

There are currently two environments, Preview and Production. They are configured with the following YAML files:

- `serverless-preview.yml`
- `serverless-prod.yml`
- `.github/workflows/preview.yml`
- `.github/workflows/production.yml`

In the former two files, bucket names and distribution IDs are hard coded and must be changed for different AWS deployments. Normally these would not be checked into version control, but since our workflow relies on GitHub automation, it was required.

### Environment variables

In these deployments, environment variables are pulled from [GitHub Environments](https://docs.github.com/en/actions/reference/environments). Note that **any environment variables added to the project** must be manually added to the appropriate steps of `.github/workflows/preview.yml` and `.github/workflows/production.yml`, in addition to the GitHub Environments, to become available to deployments. They will be pulled from the relevant GitHub Environments and made available to the `secrets` object.

For example, a developer might wish to add an environment variable `ADMIN_EMAIL`.

First, the developer should go to the Settings for this GitHub repo and navigate to Environments on the sidebar. Values for this environment variable `ADMIN_EMAIL` should be added to both the "Preview" and "Production" environments.

Then, in code, the developer should add the following line to `.github/workflows/preview.yml` and `.github/workflows/production.yml` in the "Deploy to AWS" step, within the `env` block:

```yml
ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
```

And in both `serverless-preview.yml` and `serverless-prod.yml`, add the following line to `AnnotationStudio.inputs.build`:

```yml
ADMIN_EMAIL: ${env.ADMIN_EMAIL}
```

That way, the new environment variable will be made available to the deployment in the appropriate steps.

## To Vercel

Since this project is built on Next.js, it can also be deployed directly to Vercel using their automated GitHub integrations. However, the official instance of this project has shifted toward AWS deployments.

***

This README was adapted from [hyperstudio/hidden-perspectives-app](https://github.com/hyperstudio/hidden-perspectives-app/blob/master/README.md).