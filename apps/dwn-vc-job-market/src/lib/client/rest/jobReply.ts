import { Database } from '@/__generated__/supabase-types.ts';
import axios from 'axios';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { JobReplyManager } from '@/lib/client/interfaces.ts';

export type JobReply = Database['public']['Tables']['job_replies']['Row'];

export class RestJobReplyManager implements JobReplyManager<{ jwt: string }> {
  getJobReply = async (requestParameters: {
    jwt: string;
    jobReplyId: string;
  }) => {
    const res = await axios.get<JobReply>(`${REST_API_URL}/job-replies/${requestParameters.jobReplyId}`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
  getJobReplies = async (requestParameters: {
    jwt: string;
  }) => {
    const res = await axios.get<JobReply[]>(`${REST_API_URL}/job-replies`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
  getJobRepliesByUser = async (requestParameters: {
    jwt: string;
    userId: string;
  }) => {
    const res = await axios.get<JobReply[]>(`${REST_API_URL}/users/${requestParameters.userId}/job-replies`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
  getJobRepliesByCompany = async (requestParameters: {
    jwt: string;
    companyId: string;
  }) => {
    const res = await axios.get<JobReply[]>(`${REST_API_URL}/companies/${requestParameters.companyId}/job-replies`, {
      headers: {
        'x-access-token': requestParameters.jwt,
      },
    });
    return res.data;
  };
}