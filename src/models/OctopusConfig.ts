export interface OctopusConfig {
  octopus: Config;
}

export interface Config {
  output: string;
  config: string;
  excludeAuth?: string[];
}
