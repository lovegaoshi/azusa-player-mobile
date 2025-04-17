import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
const expo = SQLite.openDatabaseSync('APM.db');

export default drizzle(expo);
