import { get_current_user } from 'libmuse';
import { useState } from 'react';

export interface User {
  channel_id: string;
  handle: string | null;
  name: string;
  thumbnails: {
    height: number;
    url: string;
    width: number;
  }[];
}

export interface UseYTMLogin {
  user: User | undefined;
  clear: () => void;
  refresh: () => void;
  initialized: boolean;
  init: () => void;
}

export const useYTMLogin = () => {
  const [user, setUser] = useState<User>();
  const [initialized, setInit] = useState(false);

  const refresh = () =>
    get_current_user()
      .then(setUser)
      .finally(() => setInit(true));

  const init = () => {
    if (!initialized) {
      refresh();
    }
  };

  return { user, clear: () => setUser(undefined), refresh, initialized, init };
};
