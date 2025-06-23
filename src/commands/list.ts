import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import { Arguments } from 'yargs';

import { displayBanner } from '../config/banner';
import { ListCommand } from '../models/args/ListCommand';
import { mapEndpointsFromYaml } from '../services/krakendEndpointGenerator';

export const list = async (argv: any) => {
  displayBanner('list');
  const args = <Arguments<ListCommand>>argv;
  if (args.file) {
    await listFromFile(args);
  } else if (args.url) {
    await listFromUrl(args);
  } else {
    console.error('You must provide a file or url to generate endpoints.');
    console.log('Run octo list --help command to see available options.');
    process.exit(1);
  }

  console.log('\n✨  All done!');
};

const listFromFile = async (args: Arguments<ListCommand>): Promise<void> => {
  const file = await readFile(args.file);
  const data = file.toString();
  const endpoints = listEndpointsFromYAML(data);
  console.log(endpoints);
};

const listFromUrl = async (args: Arguments<ListCommand>): Promise<void> => {
  const response = await fetch(args.url);
  const data = await response.text();
  const endpoints = listEndpointsFromYAML(data);
  console.log(endpoints);
};

const listEndpointsFromYAML = (yaml: string) => {
  const { endpoints } = mapEndpointsFromYaml(yaml);
  return endpoints
    .map((endpoint) => `${endpoint.method}: ${endpoint.endpoint}`)
    .join('\n');
};
