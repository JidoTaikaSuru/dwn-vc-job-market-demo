import { Database } from '@/__generated__/supabase-types.ts';
import axios from 'axios';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { UserManager } from '@/lib/client/interfaces.ts';
import { getSupabaseSession } from '@/lib/supabaseRecoil.ts';
import { selector, selectorFamily } from 'recoil';
import { JwtRequestParam } from '@/lib/common.ts';

export type UserRecord = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export class RestUserManager implements UserManager<{ jwt: string }> {
  public getUserSelector = selectorFamily<UserRecord, string>({
    key: 'userState',
    get: (userId) => async ({ get }): Promise<UserRecord> => {
      const session = get(getSupabaseSession);
      return await this.getUser({ jwt: session.session?.access_token || '', userId });
    },
  });

  public getUsersSelector = selector<UserRecord[]>({
    key: 'usersState',
    get: async ({ get }) => {
      const session = get(getSupabaseSession);
      return await this.getUsers({ jwt: session.session?.access_token || '' });
    },
  });

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

  async createUser(requestParameters: JwtRequestParam & UserInsert): Promise<UserRecord> {
    throw new Error('Method not implemented.');
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<UserRecord>(`${REST_API_URL}/users`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }

  async updateUser(requestParameters: JwtRequestParam & UserUpdate): Promise<UserRecord> {
    throw new Error('Method not implemented.');
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<UserRecord>(`${REST_API_URL}/users`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }

}