import { RenderMethod } from 'gt-react/internal';

type InitGTProps = {
  // Feature flags
  runtimeTranslation?: boolean;
  translationLoaderType?: 'remote' | 'custom' | 'disabled'; // remote: CDN, custom: uknown, disabled: no fetch
  // Request scoped filepath
  dictionary?: string;
  i18n?: string;
  config?: string;
  translationLoaderPath?: string;
  // Cloud integration
  apiKey?: string;
  projectId?: string;
  runtimeUrl?: string;
  cacheUrl?: string;
  cacheExpiryTime?: number;
  // Locale info
  locales?: string[];
  defaultLocale?: string;
  getLocale?: () => Promise<string>;
  // Rendering
  renderSettings?: {
    method: RenderMethod;
    timeout?: number;
  };
  // Other metadata
  getMetadata?: () => Promise<Record<string, any>>;
  // Batching config
  maxConcurrentRequests?: number;
  maxBatchSize?: number;
  batchInterval?: number; // ms
  // Translation assistance
  description?: string;
  // Other
  [key: string]: any;
};

export default InitGTProps;
