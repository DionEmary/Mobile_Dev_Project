import 'dotenv/config'; // Load environment variables from the .env file

export default ({ config }: { config: any }) => ({
  ...config,
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: "5b1b9edb-d38d-462c-a63f-48ea1dd21beb",
    },
  },
});