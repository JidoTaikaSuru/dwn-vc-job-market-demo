import { RestUserManager } from '@/lib/client/rest/user.ts';
import { RestJobListingManager } from '@/lib/client/rest/jobListing.ts';
import { RestCompanyManager } from '@/lib/client/rest/company.ts';
import { RestJobReplyManager } from '@/lib/client/rest/jobReply.ts';
import { CompanyManager, JobListingManager, JobReplyManager, UserManager } from '@/lib/client/interfaces.ts';


type RestClient = {
  users: UserManager<{ jwt: string }>;
  jobReplies: JobReplyManager<{ jwt: string }>;
  companies: CompanyManager<{ jwt: string }>;
  jobListings: JobListingManager<{ jwt: string }>;
}

export const restClient: RestClient = {
  users: new RestUserManager(),
  jobReplies: new RestJobReplyManager(),
  companies: new RestCompanyManager(),
  jobListings: new RestJobListingManager(),
};

