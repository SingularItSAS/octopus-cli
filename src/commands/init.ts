import { writeFile } from 'fs/promises';
import { dump } from 'js-yaml';
import { Arguments } from 'yargs';

import { displayBanner } from '../config/banner';
import { Config, OctopusConfig } from '../models/OctopusConfig';

export const init = async (argv: any) => {
  const args = <Arguments<Config>>argv;
  const { output, config } = args;
  const octoConfig: OctopusConfig = {
    octopus: {
      output,
      config,
    },
  };

  displayBanner('init');
  await writeFile('octopusrc.yml', dump(octoConfig));
};
