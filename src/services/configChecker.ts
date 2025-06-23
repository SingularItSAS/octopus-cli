import { existsSync } from 'fs';

export const checkConfigIsPresent = () => {
  if (!existsSync('octopusrc.yml') && !existsSync('octopusrc.yaml')) {
    console.error('Error: Missing octopusrc file.');
    console.log('Create octopusrc file: octo init');
    process.exit(1);
  }
};
