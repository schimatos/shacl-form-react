#!/usr/bin/env node

const { writeFileSync, readFileSync, unlinkSync } = require('fs')

const package = require('./package.json')
const packageLock = require('./package-lock.json')

const TEMPLATE_GITHUB_REPOSITORY = 'jeswr/template-typescript'
const { GITHUB_REPOSITORY } = process.env

if (GITHUB_REPOSITORY === TEMPLATE_GITHUB_REPOSITORY) {
  // eslint-disable-next-line no-console
  console.info(`Not running inside ${TEMPLATE_GITHUB_REPOSITORY} repo.`)
  process.exit()
}

if (!GITHUB_REPOSITORY) {
  throw new Error('Unknown GITHUB_REPOSITORY.')
}

const TEMPLATE_PACKAGE_NAME = package.name
const PACKAGE_NAME = `@${GITHUB_REPOSITORY.toLowerCase()}`

/**
 * package.json
 */

package.name = PACKAGE_NAME
package.homepage = `https://github.com/${GITHUB_REPOSITORY}#readme`
package.repository.url = `https://github.com/${GITHUB_REPOSITORY}.git`
package.bugs.url = `https://github.com/${GITHUB_REPOSITORY}/issues`
writeFileSync('./package.json', JSON.stringify(package, undefined, 2), { encoding: 'utf8' })

/**
 * package-lock.json
 */

packageLock.name = PACKAGE_NAME
writeFileSync('./package-lock.json', JSON.stringify(packageLock, undefined, 2), {
  encoding: 'utf8',
})

/**
 * README
 */
const readme = readFileSync('./README.md', { encoding: 'utf8' })
const newReadme = readme
  .split(TEMPLATE_PACKAGE_NAME)
  .join(PACKAGE_NAME)
  .split(TEMPLATE_GITHUB_REPOSITORY)
  .join(GITHUB_REPOSITORY)

writeFileSync('./README.md', newReadme, { encoding: 'utf8' })

/**
 * Security.md
 */
const security = readFileSync('./SECURITY.md', { encoding: 'utf8' })
const newSecurity = security
  .split(TEMPLATE_PACKAGE_NAME)
  .join(PACKAGE_NAME)
  .split(TEMPLATE_GITHUB_REPOSITORY)
  .join(GITHUB_REPOSITORY)

writeFileSync('./README.md', newSecurity, { encoding: 'utf8' })

/**
 * CLEAN UP
 */
unlinkSync('./.github/scripts/on-template.js')
unlinkSync('./.github/workflows/on-template.yml')
