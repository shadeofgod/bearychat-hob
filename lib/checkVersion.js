const semver = require('semver');
const chalk = require('chalk');
const requiredNodeVersion = require('../package.json').engines.node;

module.exports = function checkVersion() {
  if (!semver.satisfies(process.version, requiredNodeVersion)) {
    console.log(
      chalk.red(
        `\n[bearychat-hob] Minimum Node version not met:` +
          `\nYou are using Node ${process.version}, but bearychat-hob ` +
          `requires Node ${requiredNodeVersion}.\nPlease upgrade your Node version.\n`
      )
    );

    process.exit(1);
  }
};
