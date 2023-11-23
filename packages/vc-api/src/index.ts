import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./__generated__/supabase-types.js";
import credentialRoutes from "./credentials/index.js";

const server = fastify();
export const supabaseClient = createClient<Database>(
  "https://api.gotid.org",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0"
);

export const jwtAuthentication = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const jwt = request.headers["x-access-token"] as string;
  if (!jwt) {
    return reply.status(400).send("No JWT provided");
  }
  console.log("Getting the user behind jwt", jwt);
  const { data: authData, error: authError } =
    await supabaseClient.auth.getUser(jwt);
  if (authError) {
    return reply.status(400).send(authError);
  }
  if (!authData.user) {
    return reply.status(401).send("User not found");
  }
  console.log("authData", authData);
  console.log("authData.user", authData.user);
  console.log("authData.user.id", authData.user.id);
  console.log("Getting the user from the user table");
  const { data: user, error: fetchError } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .single();
  console.log("data", user, "error", fetchError);
  if (fetchError) {
    return reply.status(400).send(fetchError);
  }

  if (!user) {
    return reply.status(401).send("User not found");
  }
  request.authData = authData.user;
  request.user = user;
};

server.register(credentialRoutes);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

const listeners = ["SIGINT", "SIGTERM"];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
});
