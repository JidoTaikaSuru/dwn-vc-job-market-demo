import { JobReply } from '@/lib/client/rest/jobReply.ts';
import { JobListing } from '@/lib/client/rest/jobListing.ts';
import { Company } from '@/lib/client/rest/company.ts';
import { UserRecord } from '@/lib/client/rest/user.ts';
import { selector, selectorFamily, SerializableParam } from 'recoil';
import { Database } from '@/__generated__/supabase-types.ts';
import { JwtRequestParam } from '@/lib/common.ts';


export type DefaultJobListingSearchParams = {
  title?: string;
  description?: string;
  duration?: string;
  experience_level?: string;
  required_skills?: string[];
  project_stage?: string;
  desired_salary?: string;
  level_of_involvement?: string;
  company?: string;
}

export interface JobReplyManager<RequestParameters,
  CreateParameters = JwtRequestParam & Database['public']['Tables']['job_replies']['Insert'],
  UpdateParameters = JwtRequestParam & Database['public']['Tables']['job_replies']['Update'],
  IdType extends SerializableParam = string> {
  getJobReply: (requestParameters: RequestParameters & { jobReplyId: IdType }) => Promise<JobReply>;
  getJobReplies: (requestParameters: RequestParameters) => Promise<JobReply[]>;
  getJobRepliesByUser: (requestParameters: RequestParameters & { userId: IdType }) => Promise<JobReply[]>;
  getJobRepliesByCompany: (requestParameters: RequestParameters & { companyId: IdType }) => Promise<JobReply[]>;
  createJobReply: (requestParameters: CreateParameters) => Promise<JobReply>;
  updateJobReply: (requestParameters: UpdateParameters) => Promise<JobReply>;
}

export interface JobListingManager<RequestParameters = {jwt: string},
  CreateParameters = JwtRequestParam & Database['public']['Tables']['job_listings']['Insert'],
  UpdateParameters = JwtRequestParam & Database['public']['Tables']['job_listings']['Update'],
  SearchParameters extends SerializableParam = DefaultJobListingSearchParams,
  IdType extends SerializableParam = string> {
  getJobListingSelector: ReturnType<typeof selectorFamily<JobListing, IdType>>;
  getJobListingsSelector: ReturnType<typeof selector<JobListing[]>>;
  searchJobListingsSelector: ReturnType<typeof selectorFamily<JobListing[], SearchParameters>>,
  getJobListing: (requestParameters: RequestParameters & { jobListingId: IdType }) => Promise<JobListing>;
  getJobListings: (requestParameters: RequestParameters) => Promise<JobListing[]>;
  searchJobListings: (requestParameters: JwtRequestParam & SearchParameters) => Promise<JobListing[]>
  createJobListing: (requestParameters: CreateParameters) => Promise<JobListing>;
  updateJobListing: (requestParameters: UpdateParameters) => Promise<JobListing>;
}

export interface CompanyManager<RequestParameters,
  CreateParameters = JwtRequestParam & Database['public']['Tables']['companies']['Insert'],
  UpdateParameters = JwtRequestParam & Database['public']['Tables']['companies']['Update'],
  IdType extends SerializableParam = string> {
  getCompanySelector: ReturnType<typeof selectorFamily<Company, IdType>>;
  // getCompanySelector: ReturnType<typeof selectorFamily<Company & {jobPostCount: number}, IdType>>;
  getCompaniesSelector: ReturnType<typeof selector<Array<Company>>>;
  // getCompaniesSelector: ReturnType<typeof selector<Array<Company & {jobPostCount: number}>>>;
  getCompany: (requestParameters: RequestParameters & { companyId: IdType }) => Promise<Company>;
  getCompanies: (requestParameters: RequestParameters) => Promise<Company[]>;
  createCompany: (requestParameters: CreateParameters) => Promise<Company>;
  updateCompany: (requestParameters: UpdateParameters) => Promise<Company>;
}

export interface UserManager<RequestParameters,
  CreateParameters = JwtRequestParam & Database['public']['Tables']['users']['Insert'],
  UpdateParameters = JwtRequestParam & Database['public']['Tables']['users']['Update'],
  IdType extends SerializableParam = string> {
  getUserSelector: ReturnType<typeof selectorFamily<UserRecord, IdType>>;
  getUsersSelector: ReturnType<typeof selector<UserRecord[]>>;
  getUser: (requestParameters: RequestParameters & { userId: IdType }) => Promise<UserRecord>;
  getUsers: (requestParameters: RequestParameters) => Promise<UserRecord[]>;
  createUser: (requestParameters: CreateParameters) => Promise<UserRecord>;
  updateUser: (requestParameters: UpdateParameters) => Promise<UserRecord>;
}
