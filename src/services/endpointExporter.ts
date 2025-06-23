import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import gradient from 'gradient-string';
import { join } from 'path';

import { ApiGatewayEndpoints } from '../models/ApiGatewayEndpoint';
import { loadConfig } from './configLoader';
import { includeEndpointsInKrakend } from './krakendAppender';
import { toCamelCase } from './utils';

export const exportEndpoints = async (
  project: string,
  gateway: ApiGatewayEndpoints[],
): Promise<void> => {
  const config = await loadConfig();
  const endpointsAdded: string[] = [];
  const endpointDumper = async (endpoint: ApiGatewayEndpoints, index: number) =>
    await dumpEndpoint(
      endpoint,
      index,
      project,
      config.octopus.output,
      gateway.length,
    );

  for (let index = 0; index < gateway.length; index++) {
    endpointsAdded.push(await endpointDumper(gateway[index], index));
  }

  await includeEndpointsInKrakend(
    project,
    endpointsAdded,
    config.octopus.excludeAuth ?? [],
    config.octopus.config,
  );
};

const dumpEndpoint = async (
  endpoint: ApiGatewayEndpoints,
  index: number,
  project: string,
  folder: string,
  length: number,
): Promise<string> => {
  const { endpoints } = endpoint;
  const controller = `${toCamelCase(project)}_${endpoint.controller}`;
  const file = `${controller}.json`;
  const step = gradient('white', 'white').multiline(`[${index + 1}/${length}]`);
  console.log(`${step} 🐙  Generating ${file}...`);

  // Create output directory if it doesn't exist
  if (!existsSync(folder)) {
    await mkdir(folder, { recursive: true });
  }

  await writeFile(join(folder, file), JSON.stringify({ endpoints }, null, 2));

  return controller;
};
