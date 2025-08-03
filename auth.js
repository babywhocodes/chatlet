// auth.js
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabaseClient';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('Error during sign-in:', error.message);
    return;
  }

  const authUrl = data?.url;
  if (authUrl) {
    const result = await AuthSession.startAsync({ authUrl });
    if (result.type === 'success') {
      console.log('✅ Google login successful!');
    } else {
      console.warn('❌ Login cancelled or failed');
    }
  }
}
