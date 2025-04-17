import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/utils/db/schema',
  out: './drizzle',
});
