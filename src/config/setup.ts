import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { buildCommands } from './commandBuilder';

const defaultConfig = (yarg: Argv): Argv =>
  yarg
    .usage('Usage: $0 openapi [options]')
    .alias('version', 'v')
    .alias('help', 'h')
    .example('octo openapi -u http://localhost:8080/doc.yml', '')
    .epilog(
      'for more information visit https://github.com/singularit/octopus-cli ',
    )
    .showHelpOnFail(false, 'whoops, something went wrong! run with --help')
    .demandCommand(1, '');

export const setupInput = async () => {
  const yarg = defaultConfig(yargs(hideBin(process.argv)));
  return await buildCommands(yarg).strict().parseAsync();
};
