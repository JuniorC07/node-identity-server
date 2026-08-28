export function getEnvOrDefault(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function getPositiveIntegerEnv(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export function getRequiredBase64Env(name: string): string {
  const value = getRequiredEnv(name);

  try {
    return Buffer.from(value, 'base64').toString('utf8');
  } catch (error) {
    throw new Error(
      `Failed to decode ${name}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}

export function getRequiredAbsoluteUrlEnv(name: string): string {
  const value = getRequiredEnv(name);

  try {
    new URL(value);
    return value;
  } catch (error) {
    throw new Error(`${name} must be an absolute URL`, { cause: error });
  }
}

export function getAbsoluteUrlEnv(name: string, defaultValue: string): string {
  const value = getEnvOrDefault(name, defaultValue);

  try {
    return new URL(value).toString();
  } catch (error) {
    throw new Error(`${name} must be an absolute URL`, { cause: error });
  }
}

export function getOriginEnv(name: string, defaultValue: string): string {
  const value = getEnvOrDefault(name, defaultValue);

  try {
    const url = new URL(value);

    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new Error('Invalid origin');
    }

    return url.origin;
  } catch (error) {
    throw new Error(`${name} must be an HTTP origin without path, query, or fragment`, {
      cause: error,
    });
  }
}
