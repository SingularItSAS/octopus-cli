import { load } from 'js-yaml';
import { Arguments } from 'yargs';

import { INPUT_HEADERS } from '../config/inputHeaders';
import {
  ApiGatewayEndpoint,
  ApiGatewayEndpointMaker,
  ApiGatewayEndpoints,
} from '../models/ApiGatewayEndpoint';
import { OpenApiCommand } from '../models/args/OpenApiCommand';
import { OpenApiEndpoint } from '../models/OpenApiEndpoint';
import { exportEndpoints } from './endpointExporter';
import { toCamelCase } from './utils';

export const generateEndpoints = async (
  args: Arguments<OpenApiCommand>,
  data: string,
) => {
  const { endpoints, serverPath } = mapEndpointsFromYaml(data);

  const krakendEndpoints = generateApiGatewayEndpoints(
    args,
    endpoints,
    serverPath,
  );

  const swaggerEndpoints = generateSwaggerEndpoints(
    args.project,
    serverPath,
    '/swagger/{file}',
    '/swagger-ui',
  );

  krakendEndpoints.push({
    controller: 'swagger',
    endpoints: swaggerEndpoints,
  });

  await exportEndpoints(args.project, krakendEndpoints);
};

const generateSwaggerEndpoints = (
  project: string,
  serverPath = '',
  ...swaggerTypes: string[]
) =>
  swaggerTypes.map((swaggerType) => ({
    endpoint:
      '/api/' + project.split(' ').join('-').split('_').join('-') + swaggerType,
    method: 'GET',
    output_encoding: 'no-op',
    backend: [
      {
        host_env: createHostEnv(project),
        url_pattern: serverPath + swaggerType,
      },
    ],
  }));

const generateApiGatewayEndpoints = (
  args: Arguments<OpenApiCommand>,
  openApiEndpoints: OpenApiEndpoint[],
  serverPath = '',
): ApiGatewayEndpoints[] => {
  const endpoints = openApiEndpoints.map((endpoint) =>
    mapEndpointFromOpenApi(args, endpoint, serverPath),
  );
  const map = endpoints.reduce((controller, maker) => {
    const { tag } = maker;
    const endpoint = { ...maker };
    delete endpoint.tag;
    controller.set(tag, controller.get(tag) ?? []);
    controller.get(tag).push(endpoint);
    return controller;
  }, new Map<string, ApiGatewayEndpoint[]>());

  return Array.from(map, ([controller, endpoints]) => ({
    controller,
    endpoints,
  }));
};

const mapEndpointFromOpenApi = (
  args: Arguments<OpenApiCommand>,
  openApi: OpenApiEndpoint,
  serverPath = '',
): ApiGatewayEndpointMaker => ({
  endpoint: serverPath + openApi.endpoint,
  method: openApi.method,
  input_query_strings: ['*'],
  input_headers: [...new Set([...INPUT_HEADERS, ...openApi.headers])],
  tag: openApi.tag,
  ...(!args.graphql && { output_encoding: 'no-op' }),
  ...(openApi.roles && openApi.roles.length > 0 && { roles: openApi.roles }),
  backend: [
    {
      host_env: createHostEnv(args.project),
      url_pattern: serverPath + openApi.endpoint,
    },
  ],
});

const createHostEnv = (project: string) => [
  `${project.split(' ').join('_').toUpperCase()}_HOST`,
];

export const mapEndpointsFromYaml = (
  data: string,
): { endpoints: OpenApiEndpoint[]; serverPath: string } => {
  const yaml = load(data) as any;

  if (!yaml || !yaml.paths) {
    console.error('Invalid OpenAPI YAML: missing paths');
    return { endpoints: [], serverPath: '' };
  }

  // Extract server base path (use first server's URL path if available)
  let serverPath = '';
  if (yaml.servers && yaml.servers.length > 0) {
    const serverUrl = yaml.servers[0].url;
    if (serverUrl && serverUrl !== '/') {
      // Extract path part from URL
      try {
        const url = new URL(serverUrl, 'http://localhost');
        serverPath = url.pathname !== '/' ? url.pathname : '';
      } catch {
        // If it's a relative path, use it directly
        serverPath = serverUrl.startsWith('/') ? serverUrl : '';
      }
    }
  }

  const endpoints: OpenApiEndpoint[] = [];

  // Iterate through each path in the OpenAPI spec
  Object.entries(yaml.paths).forEach(([path, pathItem]: [string, any]) => {
    // For each HTTP method in the path
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      // Skip non-HTTP method keys (like parameters, summary, etc.)
      const httpMethods = [
        'get',
        'post',
        'put',
        'delete',
        'patch',
        'head',
        'options',
        'trace',
      ];
      if (!httpMethods.includes(method.toLowerCase())) {
        return;
      }

      if (!operation || typeof operation !== 'object') {
        return;
      }

      // Get tags (use first tag or 'default' if no tags)
      const tags = operation.tags || ['default'];
      const tag = toCamelCase(tags[0]);

      // Extract headers from parameters
      const headers: string[] = [];

      // Check operation-level parameters
      if (operation.parameters && Array.isArray(operation.parameters)) {
        operation.parameters
          .filter((param: any) => param.in === 'header')
          .forEach((param: any) => {
            if (param.name) {
              headers.push(param.name);
            }
          });
      }

      // Check path-level parameters
      if (pathItem.parameters && Array.isArray(pathItem.parameters)) {
        pathItem.parameters
          .filter((param: any) => param.in === 'header')
          .forEach((param: any) => {
            if (param.name) {
              headers.push(param.name);
            }
          });
      }

      // Extract roles from x-roles extension
      let roles: string[] = [];
      if (operation['x-roles'] && operation['x-roles'].roles) {
        const rolesString = operation['x-roles'].roles;
        if (typeof rolesString === 'string') {
          roles = rolesString.split(',').map((role: string) => role.trim());
        }
      }

      // Create the endpoint object
      endpoints.push({
        endpoint: path,
        method: method.toUpperCase(),
        tag,
        headers: [...new Set(headers)], // Remove duplicates
        ...(roles.length > 0 && { roles }),
      });
    });
  });

  return { endpoints, serverPath };
};
