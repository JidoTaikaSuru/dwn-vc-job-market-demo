import { createClient } from '@supabase/supabase-js';
import { Database } from '@/__generated__/supabase-types';
import { REST_API_URL, SupabaseCredentialManager } from '@/lib/credentialManager.ts';
import { Web5, Web5ConnectOptions } from '@web5/api/browser';
import { protocols } from '@/lib/protocols.ts';
import { DwnClient } from '@/lib/web5Client.ts';
import { configureProtocol } from '@/lib/utils.ts';
import { argon2id } from 'hash-wasm';
import * as buffer from 'buffer';
import axios from 'axios';

export const did_db_table = 'dwn_did_registry_2';
export const DEBUGGING = false;
export const LOCAL_DWN = false;
export const supabaseClient = createClient<Database>(
  'https://api.gotid.org',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicG5ibnpwZm10YmJyZ2lnempxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwNjQzODIsImV4cCI6MjAxNTY0MDM4Mn0.fS_FBY4mDgYVn1GDocKMuze5y_s_ZlX5acQ-QAVcvG0',
);
export const credentialStore = new SupabaseCredentialManager();

export type JwtRequestParam = { jwt: string };

export const genericPostRequest = async <T, D>(resource: string, jwt: string, body: D): Promise<T> => {
  const res = await axios.post<T>(`${REST_API_URL}/${resource}`, body, {
    headers: {
      'x-access-token': jwt,
    },
  });
  return res.data;
};


export const getWeb5Connection = async () => {
  const options: Web5ConnectOptions = {
    sync: '10s',
  };
  // if (LOCAL_DWN) {
  //   options.techPreview = {
  //     // See README.md for setup instructions
  //     dwnEndpoints: [
  //       // "http://localhost:3000/",
  //       "http://localhost:3001/",
  //       "http://localhost:3002/",
  //       "http://localhost:3003/",
  //     ],
  //   };
  // }
  console.log('Starting web5 connection with options: ', options);
  const web5Connection = await Web5.connect(options);
  for (const protocol of Object.values(protocols)) {
    await configureProtocol(web5Connection.web5, protocol);
  }
  console.log('web5 connection established', web5Connection);
  return web5Connection;
};

export const getWeb5Client = async () => {
  const { web5, did: myDid } = await getWeb5Connection();
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) throw new Error('No user');
  return new DwnClient({ web5, user: data.user, myDid });
};

export function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num / 2) + '....' + str.slice(str.length - num / 2);
}

export const proofOfWork = async (
  validatorDid: string,
  myDid: string,
  challenge: string,
): Promise<{ answerHash: string }> => {
  const randomHexString = () => {
    let size = Math.floor(Math.random() * Math.floor(500));
    size = size >= 16 ? size : 16;
    const randomString = [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
    return buffer.Buffer.from(randomString).toString('hex');
  };

  let answerHash = '';

  const startTime = Date.now();
  const iteration = 0;
  do {
    answerHash = await argon2id({
      password: validatorDid + myDid,
      salt: randomHexString(),
      parallelism: 2,
      iterations: 1,
      memorySize: 1000,
      hashLength: 32, // output size = 32 bytes
      outputType: 'encoded',
    });

    const lastPart = answerHash.substring(answerHash.lastIndexOf('$') + 1, answerHash.length);

    const answerHex = buffer.Buffer.from(lastPart, 'base64').toString('hex');

    if (eval(challenge)) {
      return { answerHash };
    }
  } while (Date.now() - startTime < 500000);

  throw new Error('Time Out ~ proofOfWork ~ ');
};