/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TICKETING_API?: string;
  readonly VITE_PASSENGER_API?: string;
  readonly VITE_GPS_API?: string;
  readonly VITE_NOTIFICATION_API?: string;
  readonly VITE_ANALYTICS_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
