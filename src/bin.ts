#!/usr/bin/env node

import { Builtins, Cli } from 'clipanion'
import $esm from 'esm-utils'
import { PackageJson } from 'type-fest'
// more commands
import { CompressCommand } from './commands/compress.js'
import { InfoCommand } from './commands/info.js'

const { require } = $esm(import.meta)
const { version, name, bin } = require('../package.json') as PackageJson

const [node, app, ...args] = process.argv
const cli = new Cli({
  binaryLabel: name,
  binaryName: Object.keys(bin as Record<string, string>)[0],
  binaryVersion: version,
})

cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.register(Builtins.DefinitionsCommand)

// custom command
cli.register(InfoCommand)
cli.register(CompressCommand)

// run
cli.runExit(args, Cli.defaultContext)
