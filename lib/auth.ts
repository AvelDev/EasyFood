import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "@/types";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        try {
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            const newUser: User = {
              uid: user.id,
              name: user.name || "Unknown",
              role: "user", // default role
            };
            await setDoc(userRef, newUser);
          }
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;

        // Fetch user role from Firestore
        try {
          const userRef = doc(db, "users", token.sub!);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            session.user.role = userData.role;
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
