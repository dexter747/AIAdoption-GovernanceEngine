import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Only allow specific admin emails
const ADMIN_EMAILS = [
  'maitreyak1806@gmail.com',
  // Add more admin emails here
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow admin emails
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return true;
      }
      return false;
    },
    async session({ session, token }) {
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
