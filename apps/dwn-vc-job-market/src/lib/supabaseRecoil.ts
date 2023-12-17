import { selector } from 'recoil';
import { supabaseClient } from '@/lib/common.ts';


export const getSupabaseSession = selector({
  key: 'getSupabaseSession',
  get: async () => {
    const { data, error } = await supabaseClient.auth.getSession();
    console.log('getSupabaseSession ~ data:', data);
    if (error) {
      console.error('getSupabaseSession ~ error:', error);
      return { session: undefined };
    }
    return data;
  },
});
export const getSupabaseUserSelector = selector({
  key: 'getSupabaseUserSelector',
  get: async () => {
    const { data, error } = await supabaseClient.auth.getUser();
    console.log('getSupabaseUserSelector ~ data:', data);
    if (error) {
      console.error('getSupabaseUserSelector ~ error:', error);
      return { user: undefined };
    }
    return data;
  },
});
export const getSupabaseUserTableRecordSelector = selector({
  key: 'getSupabaseUserTableRecordSelector',
  get: async ({ get }) => {
    const { user } = get(getSupabaseUserSelector);
    if (!user) return undefined;
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    return data;
  },
});