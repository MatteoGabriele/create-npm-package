const co = require('co')
const execa = require('execa')

const getGloablUserGit = co.wrap(function * (name = '', email = '') {
  try {
    const configName = yield execa.shell('git config user.name')
    const configEmail = yield execa.shell('git config user.email')

    name = configName.stdout
    email = configEmail.stdout
  } catch (error) {}

  return { name, email }
})

const hasOption = function (flag) {
  return process.argv.indexOf(`--${flag}`) !== -1
}

module.exports = {
  hasOption,
  getGloablUserGit
}
