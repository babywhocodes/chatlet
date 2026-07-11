import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabaseClient';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  native: 'com.mebadguy1.chatlet:/auth/callback',
  useProxy: false,
});

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
    },
  });

  if (error) {
    console.error('Error during sign-in:', error.message);
    return;
  }

  const authUrl = data?.url;

  if (authUrl) {
    console.log('Calling startAsync...');
    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUri,
    });

    if (result.type === 'success') {
      console.log('✅ Login successful!');
    } else {
      console.warn('❌ Login canceled or failed');
    }
  }
}
