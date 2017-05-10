[![npm version](https://badge.fury.io/js/create-npm-package.svg)](https://badge.fury.io/js/create-npm-package) 

# create-npm-package

Creates an npm package boilerplate that you don't have to write again.

![alt tag](https://raw.githubusercontent.com/MatteoGabriele/create-npm-package/master/example.gif)


## Install

```bash
$ npm install -g create-npm-package
```

## Usage

### Create new package

```bash
$ create-npm-package my-package
```

### Skip the npm name check

The existance of the package name is checked automatically, but you can skip it!

```bash
$ create-npm-package my-package --skip-check
```

### Skip git initialization 

Git is initialized on package creation, but you can skip it!

```bash
$ create-npm-package my-package --skip-git
```

### Use Yarn to install dependencies

```bash
$ create-npm-package my-package --yarn
```

## Git configuration

To be able to grab your git global data and add them to the package.json automatically, you need to 

```bash
$ git config --global user.name 'your name'
```

```bash
$ git config --global user.email 'your@email'
```

and if you want to add also the repository url, just run 

```bash
$ git config --global user.url 'https://github.com/your_account_name'
```

# Issues and features requests

Please drop an issue, if you find something that doesn't work, or a feature request at [https://github.com/MatteoGabriele/create-npm-package/issues](https://github.com/MatteoGabriele/create-npm-package/issues)

Follow me on twitter [@matteo\_gabriele](https://twitter.com/matteo_gabriele)
