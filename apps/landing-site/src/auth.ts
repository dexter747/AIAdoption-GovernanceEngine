import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Simplified auth without service role key
// Users will be created in Supabase via their Auth provider integration
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow sign in for all Google users
      console.log('✅ User signed in:', user.email);
      return true;
    },
    async session({ session, token }) {
      // Add user ID from token to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
