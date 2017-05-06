#!/usr/bin/env node

const kopy = require('kopy')
const fs = require('fs')
const path = require('path')
const Listr = require('listr')
const execa = require('execa')
const co = require('co')

const name = process.argv[2]

if (!name) {
  console.log('Please specify name of the package')
  process.exit(1)
}

const gitignore = path.resolve(__dirname, './.gitignore')
const dest = path.resolve(process.cwd(), name)
const template = path.resolve(__dirname, './template')

const getGloablUserGit = co.wrap(function * (name = '', email = '') {
  try {
    const configName = yield execa.shell('git config user.name')
    const configEmail = yield execa.shell('git config user.email')

    name = configName.stdout
    email = configEmail.stdout
  } catch (error) {}

  return { name, email }
})

const tasks = new Listr([
  {
    title: 'Get git global user information',
    task: ctx => getGloablUserGit().then(response => {
      ctx.gitUser = response
      return ctx
    })
  },
  {
    title: 'Drop package scaffold',
    task: ctx => kopy(template, dest, {
      data: {
        name: name,
        author: ctx.gitUser
      }
    })
  },
  {
    title: 'Install dependencies',
    task: () => {
      process.chdir(dest)
      return execa('npm', ['install'])
    }
  },
  {
    title: 'Initialize git',
    task: () => {
      const gitignoreContent = fs.readFileSync(gitignore, 'utf8')
      fs.writeFileSync(`${dest}/.gitignore`, gitignoreContent)
      return execa('git', ['init'])
    }
  }
])

tasks.run()
  .then(response => {
    console.log(`
    Npm package as been created successfully!

    Start coding:
      cd ${name} && npm run dev
    `)
  })
  .catch(error => console.log(error))
