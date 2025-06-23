import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { exit } from 'process';

import { toCamelCase } from './utils';

export const includeEndpointsInKrakend = async (
  project: string,
  endpointsAdded: string[],
  controllersToExcludeFromAuth: string[],
  targetFile: string,
) => {
  let title = project;
  if (title.startsWith('legacy')) {
    title = title.split('_').join(' ');
  }

  title = title.charAt(0).toUpperCase() + toCamelCase(title.slice(1), ' ', ' ');

  const comment = `    {{- /* ${title} Endpoints */ -}}`;
  const endpointsConfig = endpointsAdded
    .map((e) => buildEndpointTemplate(e, controllersToExcludeFromAuth))
    .join(',\n');

  const krakendMainFileContent = await loadKrakendMainFile(targetFile);

  const newContent = generateKrakendFormat(
    krakendMainFileContent,
    comment,
    endpointsConfig,
  );

  await writeFile(targetFile, newContent);
};

const buildEndpointTemplate = (
  file: string,
  controllersToExcludeFromAuth: string[],
) => {
  const jwt = file.includes('swagger') ? '_anyJwt' : '_jwt';
  if (controllersToExcludeFromAuth.includes(file)) {
    return `    {{ template "endpoint.tmpl" .${file} }}`;
  }
  return `    {{ template "endpoint.tmpl" (merge .${file} .${jwt}) }}`;
};

const loadKrakendMainFile = async (file: string) => {
  if (!existsSync(file)) {
    console.error('Error: Missing octopusrc file.');
    console.log('Create octopusrc file: octo init');
    exit(1);
  }

  return (await readFile(file)).toString();
};
function generateKrakendFormat(
  krakendMainFileContent: string,
  comment: string,
  endpointsConfig: string,
) {
  const lines = krakendMainFileContent.split('\n');
  const lastLine = lines.findIndex((line) => line.includes(']')) - 1; // Default to last line
  let insertIndex = lastLine;
  let endOfBlockIndex = lastLine;
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().toLowerCase() === comment.trim().toLowerCase()) {
      insertIndex = i;
      found = true;
    } else if (
      found &&
      lines[i].trim().startsWith('{{- /*') &&
      lines[i].trim().endsWith('*/ -}}')
    ) {
      endOfBlockIndex = i;
      break;
    }
  }

  const isLast = lines[endOfBlockIndex + 1].includes(']');

  const isNew = insertIndex === lastLine;
  const topSpaces = isNew ? ['', ''] : [];
  const bottomSpaces = !isNew && !isLast ? ['', ''] : [];

  if (isNew) {
    lines[lastLine] = lines[lastLine]?.endsWith(',')
      ? lines[lastLine]
      : lines[lastLine] + ',';
  } else {
    endpointsConfig = isLast ? endpointsConfig : endpointsConfig + ',';
  }

  return [
    ...lines.slice(0, insertIndex + (isNew ? 1 : 0)),
    ...topSpaces,
    comment,
    endpointsConfig,
    ...bottomSpaces,
    ...lines.slice(endOfBlockIndex + (isNew || isLast ? 1 : 0)),
  ].join('\n');
}
