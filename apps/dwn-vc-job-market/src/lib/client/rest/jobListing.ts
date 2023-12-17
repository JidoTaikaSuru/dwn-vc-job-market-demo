import axios from 'axios';
import { Database } from '@/__generated__/supabase-types.ts';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { JobListingManager } from '@/lib/client/interfaces.ts';
import { selector, selectorFamily } from 'recoil';
import { getSupabaseSession } from '@/lib/supabaseRecoil.ts';
import { JwtRequestParam } from '@/lib/common.ts';

export type JobListing = Database['public']['Tables']['job_listings']['Row'];
export type JobListingInsert = Database['public']['Tables']['job_listings']['Insert'];
export type JobListingUpdate = Database['public']['Tables']['job_listings']['Update'];

export class RestJobListingManager implements JobListingManager<{ jwt: string }> {
  public getJobListingSelector = selectorFamily<JobListing, string>({
    key: 'jobListingState',
    get: (jobListingId) => async ({get}): Promise<Database['public']['Tables']['job_listings']['Row']> => {
      const session = get(getSupabaseSession);
      return await this.getJobListing({jwt: session.session?.access_token || "", jobListingId});
    },
  })
  public getJobListingsSelector = selector<JobListing[]>({
    key: 'jobListingsState',
    get: async ({ get }) => {
      const session = get(getSupabaseSession);
      return await this.getJobListings({ jwt: session.session?.access_token || "" });
    },
  })

  getJobListing = async (requestParameters: {
    jwt: string;
    jobListingId: string;
  }) => {
    const res = await axios.get<
      JobListing
    >(`${REST_API_URL}/job-listings/${requestParameters.jobListingId}`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
  getJobListings = async (requestParameters: {
    jwt: string;
  }) => {
    const res = await axios.get<JobListing[]>(`${REST_API_URL}/job-listings`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };

  async createJobListing(requestParameters: JwtRequestParam & JobListingInsert): Promise<JobListing> {
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<JobListing>(`${REST_API_URL}/job-listings`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }

  async updateJobListing(requestParameters: JwtRequestParam & JobListingUpdate): Promise<JobListing> {
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<JobListing>(`${REST_API_URL}/job-listings`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }
}