import { Database } from '@/__generated__/supabase-types.ts';
import axios from 'axios';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { CompanyManager } from '@/lib/client/interfaces.ts';
import { selector, selectorFamily } from 'recoil';
import { getSupabaseSession } from '@/lib/supabaseRecoil.ts';

export type Company = Database['public']['Tables']['companies']['Row'];

export class RestCompanyManager implements CompanyManager<{ jwt: string }> {
  public getCompanySelector = selectorFamily<Company, string>({
    key: 'companyState',
    get: (companyId) => async ({ get }): Promise<Company> => {
      const session = get(getSupabaseSession);
      return await this.getCompany({ jwt: session.session?.access_token || '', companyId });
    },
  });
  public getCompaniesSelector = selector<Company[]>({
    key: 'companiesState',
    get: async ({ get }) => {
      const session = get(getSupabaseSession);
      return await this.getCompanies({ jwt: session.session?.access_token || '' });
    },
  });

  getCompany = async (requestParameters: {
    jwt: string;
    companyId: string;
  }) => {
    console.log()
    const res = await axios.get<Company>(`${REST_API_URL}/companies/${requestParameters.companyId}`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });

    return res.data;
  };

  getCompanies = async (requestParameters: {
    jwt: string;
  }) => {
    const res = await axios.get<Company[]>(`${REST_API_URL}/companies`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };

  async createCompany(requestParameters: {jwt: string} & Database['public']['Tables']['companies']['Insert']) {
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<Company>(`${REST_API_URL}/companies`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }

  async updateCompany(requestParameters: {jwt: string} & Database['public']['Tables']['companies']['Update']): Promise<Company> {
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<Company>(`${REST_API_URL}/companies`, rest, {
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }
  // Below are supabase native
  // async createCompany(requestParameters: Database['public']['Tables']['companies']['Insert']) {
  //   const { data: user } = await supabaseClient.from('companies').insert(requestParameters).select().single();
  //   if (!user) {
  //     throw new Error('Failed to create user');
  //   }
  //   return user;
  // }
  //
  // async updateCompany(requestParameters: Database['public']['Tables']['companies']['Update']): Promise<Company> {
  //   const { data: user } = await supabaseClient.from('companies').update(requestParameters).select().single();
  //   if (!user) {
  //     throw new Error('Failed to create user');
  //   }
  //   return user;
  // }

}

