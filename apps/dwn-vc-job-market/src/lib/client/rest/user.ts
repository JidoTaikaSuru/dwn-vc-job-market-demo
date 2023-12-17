import { Database } from '@/__generated__/supabase-types.ts';
import axios from 'axios';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { UserManager } from '@/lib/client/interfaces.ts';

export type UserRecord = Database['public']['Tables']['users']['Row'];

export class RestUserManager implements UserManager<{ jwt: string }> {
  getUser = async (requestParameters: {
    jwt: string;
    userId: string;
  }) => {
    const res = await axios.get<UserRecord>(`${REST_API_URL}/users/${requestParameters.userId}`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
  getUsers = async (requestParameters: {
    jwt: string;
  }) => {
    const res = await axios.get<UserRecord[]>(`${REST_API_URL}/users`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
}