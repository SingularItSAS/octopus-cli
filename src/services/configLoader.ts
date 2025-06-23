import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { load } from 'js-yaml';

import { OctopusConfig } from '../models/OctopusConfig';

export const loadConfig = async (): Promise<OctopusConfig> => {
  let file = 'octopusrc.yaml';
  if (existsSync('octopusrc.yml')) {
    file = 'octopusrc.yml';
  }
  const content = (await readFile(file)).toString();
  return load(content) as OctopusConfig;
};
