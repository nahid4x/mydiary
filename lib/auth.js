import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const normalizedEmail = credentials.email.trim().toLowerCase()
          const user = await prisma.user.findUnique({
           where: { email: normalizedEmail },
            })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.avatar = user.avatar
        token.role = user.role
      }
      if (trigger === 'update' && session) {
        token.name = session.name
        token.avatar = session.avatar
        // Allow the client to push a fresh email after a verified change
        // (see ChangeEmailForm -> update({ email }) )
        if (session.email) token.email = session.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.avatar = token.avatar
        session.user.role = token.role
        // Explicit assignment so a post-signup email change is reflected;
        // otherwise this falls back to the default next-auth behavior.
        session.user.email = token.email
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}