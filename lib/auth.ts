import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "temp-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "temp-google-secret",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "temp-facebook-id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "temp-facebook-secret",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "temp-apple-id",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "temp-apple-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Alice" },
        email: { label: "Email", type: "email", placeholder: "alice@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // If no user is found, we automatically create one (Sign Up) for the MVP
          if (!credentials.name) throw new Error("Name is required to sign up");
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              password: hashedPassword,
            }
          });
        } else {
          // Verify password
          if (!user.password) throw new Error("Please log in with OAuth");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error("Invalid password");
        }

        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  }
};
