#!/usr/bin/env node

import { createRequire } from 'node:module'
import { Builtins, Cli } from 'clipanion'
import { CompressCommand } from './commands/compress'
import { InfoCommand } from './commands/info'
import { RotateCommand } from './commands/rotate'
import type { PackageJson } from 'type-fest'

const require = createRequire(import.meta.url)
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
cli.register(RotateCommand)

// run
cli.runExit(args, Cli.defaultContext)
