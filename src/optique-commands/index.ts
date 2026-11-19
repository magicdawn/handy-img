import { runProgram } from '@optique/discover'
import { compressCommand } from './compress'

runProgram({
  commands: [compressCommand],
  metadata: {
    name: 'himg',
  },
})
