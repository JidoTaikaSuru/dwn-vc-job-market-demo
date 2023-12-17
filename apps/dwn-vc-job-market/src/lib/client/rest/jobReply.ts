import { Database } from '@/__generated__/supabase-types.ts';
import axios from 'axios';
import { REST_API_URL } from '@/lib/credentialManager.ts';
import { JobReplyManager } from '@/lib/client/interfaces.ts';
import { JwtRequestParam } from '@/lib/common.ts';

export type JobReply = Database['public']['Tables']['job_replies']['Row'];
export type JobReplyInsert = Database['public']['Tables']['job_replies']['Insert'];
export type JobReplyUpdate = Database['public']['Tables']['job_replies']['Update'];

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

  async createJobReply(requestParameters: JwtRequestParam & JobReplyInsert): Promise<JobReply> {
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<JobReply>(`${REST_API_URL}/job-replies`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
  }

  async updateJobReply(requestParameters: JwtRequestParam & JobReplyUpdate): Promise<JobReply> {
    const {jwt, ...rest} = requestParameters;
    const res = await axios.post<JobReply>(`${REST_API_URL}/job-replies`, rest,{
      headers: {
        'x-access-token': jwt,
      },
    });
    return res.data;
}