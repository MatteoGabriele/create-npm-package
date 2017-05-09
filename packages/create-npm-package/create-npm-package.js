#!/usr/bin/env node

const kopy = require('kopy')
const fs = require('fs')
const path = require('path')
const Listr = require('listr')
const execa = require('execa')
const fetch = require('node-fetch')
const co = require('co')
const extractPackage = require('extract-package')
const argv = require('minimist')(process.argv.slice(2))

const name = argv._[0]
const useYarn = argv.yarn
const skipPackageCheck = argv['skip-check']
const skipGitInit = argv['skip-git']
const version = argv['version']

if (version) {
  console.log('v' + require('./package.json').version)
  process.exit(0)
}

if (!name) {
  console.log('Please specify name of the package')
  process.exit(1)
}

const gitignore = 'dist/\n' +
'node_modules/\n' +
'.DS_Store\n' +
'npm-debug.log\n' +
'yarn-error.log\n'

const dest = path.resolve(process.cwd(), name)

const tasks = new Listr([
  {
    title: 'Check for package existance',
    skip: () => skipPackageCheck,
    task: () => fetch(`http://registry.npmjs.org/${name}`)
      .then(response => {
        return response.json()
      })
      .then(packageInfo => {
        if (!packageInfo.name) {
          return
        }

        throw new Error(`${name} already exists https://www.npmjs.com/package/${name}`)
      })
  },
  {
    title: 'Get git global user information',
    task: ctx => {
      const getGloablUserGit = co.wrap(function * (name = '', email = '', url = '') {
        try {
          const configName = yield execa.shell('git config user.name')
          const configEmail = yield execa.shell('git config user.email')
          const configUrl = yield execa.shell('git config user.url')

          name = configName.stdout
          email = configEmail.stdout
          url = configUrl.stdout
        } catch (error) {}

        return { name, email, url }
      })

      return getGloablUserGit().then(user => ctx.gitUser = user)
    }
  },
  {
    title: 'Download scaffold',
    task: ctx => extractPackage({
      name: 'create-npm-package-scaffold',
      tag: 'beta'
    }).then(templatePath => ctx.templatePath = templatePath)
  },
  {
    title: 'Drop package scaffold',
    task: ctx => kopy(`${ctx.templatePath}/src`, dest, {
      data: {
        name: name,
        author: ctx.gitUser,
        issuesUrl: ctx.gitUser.url !== '' ? `${ctx.gitUser.url}/${name}/issues` : '',
        repositoryUrl: ctx.gitUser.url !== '' ? `${ctx.gitUser.url}/${name}` : ''
      }
    }).then(() => {
      const filePath = `${dest}/package.json`
      const file = fs.readFileSync(filePath, 'utf8')
      const scaffoldPackageJSON = JSON.parse(file)

      // files property needs to be added programmatically or all scaffold folder
      // will be ignored during create-npm-package publish
      scaffoldPackageJSON.files = ['dist']

      fs.writeFileSync(filePath, JSON.stringify(scaffoldPackageJSON, null, 2))
    })
  },
  {
    title: 'Install dependencies with Yarn',
    enabled: () => useYarn,
    task: () => {
      process.chdir(dest)
      return execa('yarn')
    }
  },
  {
    title: 'Install dependencies',
    enabled: () => !useYarn,
    task: () => {
      process.chdir(dest)
      return execa('npm', ['install'])
    }
  },
  {
    title: 'Initialize git',
    skip: () => skipGitInit,
    task: () => {
      fs.writeFileSync(`${dest}/.gitignore`, gitignore)
      return execa('git', ['init'])
    }
  }
])

tasks.run()
  .then(response => {
    const cmdStart = useYarn ? 'yarn dev' : 'npm run dev'
    const cmdBuild = useYarn ? 'yarn build' : 'npm run build'

    console.log(`
    Npm package as been created successfully!

    Start coding:
      cd ${name} && ${cmdStart}

    Build your package
      cd ${name} && ${cmdBuild}
    `)
  })
  .catch(() => {})
