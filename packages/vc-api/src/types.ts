import { Database } from "./__generated__/supabase-types.js";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {VerifiableCredential} from "@veramo/core";

// adding jwt property to req
// authenticate property to FastifyInstance
declare module "fastify" {
  interface FastifyRequest {
    authData: SupabaseUser;
    user: Database["public"]["Tables"]["users"]["Row"];
    vc: VerifiableCredential
  }

  export interface FastifyInstance {
    jwtAuthenticate: any;
  }
}


