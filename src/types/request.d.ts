declare namespace NoxNetwork {
  export interface RequestInit {
    method: string;
    headers: any;
    body?: any;
    referrer?: string;
    credentials?: RequestCredentials_;
  }
}