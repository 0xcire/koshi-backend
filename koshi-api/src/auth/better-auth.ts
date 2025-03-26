import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provdier: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  }
})
