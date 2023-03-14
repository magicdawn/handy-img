import { Command, Option, Usage } from 'clipanion'
import path from 'path'
import { decode, metadata } from '../'

export class InfoCommand extends Command {
  static paths = [['info'], ['i']]

  static usage: Usage = {
    description: 'show info for file',
  }

  file = Option.String({ required: true })

  execute(): Promise<number | void> {
    return main(this)
  }
}

export async function main(argv: { file: string }) {
  let { file } = argv
  if (file) file = path.resolve(file)

  const meta = await metadata(file)
  console.log('metadata: %o', meta)

  const decoded = await decode(file)
  console.log('decoded info: %s', decoded)
}
