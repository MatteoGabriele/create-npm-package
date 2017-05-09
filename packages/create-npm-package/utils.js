const co = require('co')
const execa = require('execa')

const getGloablUserGit = co.wrap(function * (name = '', email = '', url = '') {
  try {
    const configName = yield execa.shell('git config user.name')
    const configEmail = yield execa.shell('git config user.email')
    const configUrl = yield execa.shell('git config user.url')

    name = configName.stdout
    email = configEmail.stdout
  } catch (error) {}

  return { name, email, url }
})

module.exports = {
  getGloablUserGit
}
