#!/usr/bin/env node

const yargs = require('yargs')

yargs
  .commandDir(__dirname + '/commands')
  .demandCommand()
  .help().argv
