import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import { Arguments } from 'yargs';

import { displayBanner } from '../config/banner';
import { OpenApiCommand } from '../models/args/OpenApiCommand';
import { checkConfigIsPresent } from '../services/configChecker';
import { generateEndpoints } from '../services/krakendEndpointGenerator';

export const openapi = async (argv: any): Promise<void> => {
  checkConfigIsPresent();
  displayBanner('openapi');
  const args = <Arguments<OpenApiCommand>>argv;
  args.project = args.project.split('-').join(' ');
  if (args.file) {
    await generateFromFile(args);
  } else if (args.url) {
    await generateFromUrl(args);
  } else {
    console.error('You must provide a file or url to generate endpoints.');
    console.log('Run octo openapi --help command to see available options.');
    process.exit(1);
  }

  console.log('\n✨  All done!');
};

const generateFromFile = async (
  args: Arguments<OpenApiCommand>,
): Promise<void> => {
  const file = await readFile(args.file);
  const data = file.toString();
  await generateEndpoints(args, data);
};

const generateFromUrl = async (
  args: Arguments<OpenApiCommand>,
): Promise<void> => {
  const response = await fetch(args.url, {
    headers: { Authorization: `Bearer ${args.token}` },
  });

  if (response.status >= 300) {
    console.error(`Error: [${response.status}] ${response.statusText}`);
    return;
  }

  const data = await response.text();
  await generateEndpoints(args, data);
};
