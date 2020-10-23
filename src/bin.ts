#!/usr/bin/env node

import yargs from 'yargs'

yargs
  .commandDir(__dirname + '/commands')
  .demandCommand()
  .help().argv
