import gradient from 'gradient-string';

export const banner = (action: string) =>
  gradient.passion(`
   ____       __
  / __ \\_____/ /_____  ____  __  _______
 / / / / ___/ __/ __ \\/ __ \\/ / / / ___/
/ /_/ / /__/ /_/ /_/ / /_/ / /_/ (__  )
\\____/\\___/\\__/\\____/ .___/\\__,_/____/
                   /_/        v0.0.10
Octopus [${action}]
\n`);

export const displayBanner = (action: string) => console.log(banner(action));
