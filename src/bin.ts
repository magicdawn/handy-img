import yargs from 'yargs'

// cmds
import cmdInfo from './commands/info'
import cmdCompress from './commands/compress'

yargs
  //
  .command(cmdInfo)
  .command(cmdCompress)
  .demandCommand()
  .help().argv
