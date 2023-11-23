import { Database } from "./__generated__/supabase-types.js";
import { User as SupabaseUser } from "@supabase/supabase-js";

// adding jwt property to req
// authenticate property to FastifyInstance
declare module "fastify" {
  interface FastifyRequest {
    authData: SupabaseUser;
    user: Database["public"]["Tables"]["users"]["Row"];
  }

  export interface FastifyInstance {
    jwtAuthenticate: any;
  }
}


