import chalk from 'chalk';
import Database from "better-sqlite3"
export function startup(): Database.Database {

        const db = new Database("markets.db");
        db.pragma("journal_mode = WAL");
        return db;

}