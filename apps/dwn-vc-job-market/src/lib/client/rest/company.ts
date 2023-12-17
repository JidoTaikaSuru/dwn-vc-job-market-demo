import { Database } from '@/__generated__/supabase-types.ts';
import axios from 'axios';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { CompanyManager } from '@/lib/client/interfaces.ts';
import { selectorFamily } from 'recoil';
import { getSupabaseSession } from '@/lib/supabaseRecoil.ts';

export type Company = Database['public']['Tables']['companies']['Row'];

export class RestCompanyManager implements CompanyManager<{ jwt: string }> {
  public getCompanySelector = selectorFamily<Company, string>({
    key: 'companyState',
    get: (companyId) => async ({get}): Promise<Company> => {
      const session = get(getSupabaseSession)
      return await this.getCompany({jwt: session.session?.access_token || "", companyId})
    },
  })
  public getCompaniesSelector = selector<Company[]>({
    key: 'companiesState',
    get: async ({ get }) => {
      const session = get(getSupabaseSession)
      return await restClient.companies.getCompanies({ jwt: session.session?.access_token || "" })
    },
  })


  getCompany = async (requestParameters: {
    jwt: string;
    companyId: string;
  }) => {
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

}

