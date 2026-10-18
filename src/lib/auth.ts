import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          initials: user.initials || (user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "AY"),
          clientSince: user.clientSince || "Nov 2025",
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If it's a relative URL, allow it
      if (url.startsWith("/")) {
        return url;
      }
      try {
        const parsed = new URL(url);
        // Validate against trusted domains to eliminate open redirect and localhost redirect vulnerabilities
        if (
          parsed.hostname === "moemen-team.tech" ||
          parsed.hostname === "www.moemen-team.tech" ||
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1"
        ) {
          return url;
        }
      } catch {}
      return "/login";
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.company = (user as any).company;
        token.initials = (user as any).initials;
        token.clientSince = (user as any).clientSince;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.company = token.company as string;
        session.user.initials = token.initials as string;
        session.user.clientSince = token.clientSince as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};
