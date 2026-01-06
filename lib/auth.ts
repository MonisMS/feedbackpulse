import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db, user, account } from "@/lib/db";
import { compare } from "bcryptjs";
import { eq, and } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const [existingUser] = await db
          .select()
          .from(user)
          .where(eq(user.email, credentials.email))
          .limit(1);

        if (!existingUser || !existingUser.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          existingUser.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: existingUser.id.toString(),
          email: existingUser.email,
          name: existingUser.name,
        };
      },
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async signIn({ user: signInUser, account: signInAccount }) {
      if (signInAccount?.provider === "google" || signInAccount?.provider === "github") {
        if (!signInUser.email) return false;

        try {
          const [existingUser] = await db
            .select()
            .from(user)
            .where(eq(user.email, signInUser.email))
            .limit(1);

          let userId: number;

          if (!existingUser) {
            const [newUser] = await db
              .insert(user)
              .values({
                email: signInUser.email,
                name: signInUser.name || null,
                image: signInUser.image || null,
                emailVerified: new Date(),
                passwordHash: null,
              })
              .returning();
            
            userId = newUser.id;
            signInUser.id = newUser.id.toString();
          } else {
            userId = existingUser.id;
            signInUser.id = existingUser.id.toString();
          }

          const [existingAccount] = await db
            .select()
            .from(account)
            .where(
              and(
                eq(account.provider, signInAccount.provider),
                eq(account.providerAccountId, signInAccount.providerAccountId)
              )
            )
            .limit(1);

          if (!existingAccount) {
            await db.insert(account).values({
              userId: userId,
              type: signInAccount.type as "email" | "oauth" | "oidc" | "webauthn",
              provider: signInAccount.provider,
              providerAccountId: signInAccount.providerAccountId,
              refresh_token: signInAccount.refresh_token,
              access_token: signInAccount.access_token,
              expires_at: signInAccount.expires_at,
              token_type: signInAccount.token_type,
              scope: signInAccount.scope,
              id_token: signInAccount.id_token,
              session_state: signInAccount.session_state,
            });
          }
        } catch (error) {
          console.error("OAuth sign-in error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user: jwtUser }) {
      if (jwtUser) {
        token.id = jwtUser.id;
        token.email = jwtUser.email;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
