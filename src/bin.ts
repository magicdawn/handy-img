#!ts-node

import { Cli, Builtins } from 'clipanion'
import { PackageJson } from 'type-fest'

// more commands
import { InfoCommand } from './commands/info'
import { CompressCommand } from './commands/compress'

const { version, name, bin } = require('../package') as PackageJson

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
