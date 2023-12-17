import { JobReply } from '@/lib/client/rest/jobReply.ts';
import { JobListing } from '@/lib/client/rest/jobListing.ts';
import { Company } from '@/lib/client/rest/company.ts';
import { UserRecord } from '@/lib/client/rest/user.ts';
import { selectorFamily } from 'recoil';

export interface JobReplyManager<RequestParameters, IdType = string> {
  getJobReply: (requestParameters: RequestParameters & { jobReplyId: IdType }) => Promise<JobReply>;
  getJobReplies: (requestParameters: RequestParameters) => Promise<JobReply[]>;
  getJobRepliesByUser: (requestParameters: RequestParameters & { userId: IdType }) => Promise<JobReply[]>;
  getJobRepliesByCompany: (requestParameters: RequestParameters & { companyId: IdType }) => Promise<JobReply[]>;
}

export interface JobListingManager<RequestParameters, IdType = string> {
  getJobListing: (requestParameters: RequestParameters & { jobListingId: IdType }) => Promise<JobListing>;
  getJobListings: (requestParameters: RequestParameters) => Promise<JobListing[]>;
  // getJobListingsByUser: (requestParameters: RequestParameters & { userId: IdType }) => Promise<JobListing[]>;
  // getJobListingsByCompany: (requestParameters: RequestParameters & { companyId: IdType }) => Promise<JobListing[]>;
}

export interface CompanyManager<RequestParameters, IdType = string> {
getCompanySelector: ReturnType<typeof selectorFamily<Company, string>>;
  getCompany: (requestParameters: RequestParameters & { companyId: IdType }) => Promise<Company>;
  getCompanies: (requestParameters: RequestParameters) => Promise<Company[]>;
}

export interface UserManager<RequestParameters, IdType = string> {
  getUser: (requestParameters: RequestParameters & { userId: IdType }) => Promise<UserRecord>;
  getUsers: (requestParameters: RequestParameters) => Promise<UserRecord[]>;
}