import axios from 'axios';
import { Database } from '@/__generated__/supabase-types.ts';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { JobListingManager } from '@/lib/client/interfaces.ts';

export type JobListing = Database['public']['Tables']['job_listings']['Row'];

export class RestJobListingManager implements JobListingManager<{ jwt: string }> {
  getJobListing = async (requestParameters: {
    jwt: string;
    jobListingId: string;
  }) => {
    const res = await axios.get<
      Database['public']['Tables']['job_listings']['Row']
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
}