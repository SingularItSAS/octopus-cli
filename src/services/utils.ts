export const toCamelCase = (str: string, sep = ' ', join = ''): string => {
  return str
    .toLowerCase()
    .split(sep)
    .map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(join);
};
