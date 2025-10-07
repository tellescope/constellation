import { Tellescope } from '@tellescope/sdk';
import { EnvironmentConfig } from './types';

export class TellescopeClientFactory {
  private static instances: Map<string, Tellescope> = new Map();

  static getClient(config: EnvironmentConfig): Tellescope {
    const key = `${config.environment}-${config.apiKey}`;

    if (!this.instances.has(key)) {
      const client = new Tellescope({
        apiKey: config.apiKey,
        host: config.host,
      });
      this.instances.set(key, client);
    }

    return this.instances.get(key)!;
  }

  static clearClients(): void {
    this.instances.clear();
  }
}
