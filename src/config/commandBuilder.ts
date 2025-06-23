import { Argv } from 'yargs';

import { init } from '../commands/init';
import { list } from '../commands/list';
import { openapi } from '../commands/openapi';

export const buildCommands = (argv: Argv) => {
  const initCommand = buildInitCommand(argv);
  const openApiCommand = buildOpenApiCommand(initCommand);
  return buildListCommand(openApiCommand);
};

const buildInitCommand = (argv: Argv) =>
  argv.command(
    'init',
    'Generates yaml configuration file for the cli',
    {
      output: {
        alias: 'o',
        description: 'Choose where to generate the endpoints',
        type: 'string',
        default: './',
      },
      config: {
        alias: 'c',
        description: 'The krakend root configuration file',
        type: 'string',
        default: './config.json',
      },
    },
    init,
  );

const buildOpenApiCommand = (argv: Argv) =>
  argv.command(
    'openapi',
    'Generates api gateway endpoints from OpenApi Documentation',
    {
      url: {
        alias: 'u',
        description: 'URL of the OpenApi Documentation',
        type: 'string',
      },
      token: {
        alias: 't',
        description: 'Token for Bearer Authorization',
        type: 'string',
      },
      file: {
        alias: 'f',
        description: 'YAML file of the OpenApi Documentation',
        type: 'string',
      },
      graphql: {
        alias: 'g',
        type: 'boolean',
        default: false,
      },
      project: {
        alias: 'p',
        description: 'Project name of the current application',
        type: 'string',
        demandOption: true,
      },
    },
    openapi,
  );

const buildListCommand = (argv: Argv) =>
  argv.command(
    'list',
    'Generates list of endpoints from OpenApi Documentation',
    {
      url: {
        alias: 'u',
        description: 'URL of the OpenApi Documentation',
        type: 'string',
      },
      file: {
        alias: 'f',
        description: 'YAML file of the OpenApi Documentation',
        type: 'string',
      },
      export: {
        alias: 'e',
        description: 'File to export the endpoints output list',
        type: 'string',
      },
    },
    list,
  );
