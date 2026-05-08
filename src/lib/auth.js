import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { agency: true },
        });

        if (!user) {
          throw new Error('Email tidak ditemukan');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Password salah');
        }

        if (user.role === 'operator' && user.agency && !user.agency.isActive) {
          throw new Error('Akun Mitra Anda sedang menunggu persetujuan dari Admin.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          agencyId: user.agency?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.agencyId = user.agencyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.agencyId = token.agencyId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
