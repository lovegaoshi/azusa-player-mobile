import { get_current_user } from 'libmuse';
import { useEffect, useState } from 'react';

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
export const useYTMLogin = () => {
  const [user, setUser] = useState<User>();
  const [initialized, setInit] = useState(false);

  const refresh = () =>
    get_current_user()
      .then(setUser)
      .finally(() => setInit(true));

  useEffect(() => {
    refresh();
  }, []);

  return { user, clear: () => setUser(undefined), refresh, initialized };
};
