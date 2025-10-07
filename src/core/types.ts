import { Tellescope } from '@tellescope/sdk';

export interface ScriptConfig {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
}

export interface ScriptContext {
  client: Tellescope;
  config: ScriptConfig;
  dryRun?: boolean;
}

export interface ScriptResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface EnvironmentConfig {
  apiKey: string;
  host?: string;
  environment: 'development' | 'staging' | 'production';
}
