"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured in environment variables");
    }
    const sql = neon(databaseUrl);
    // Runs a basic test query to check database connection status
    const data = await sql`SELECT NOW(), current_database(), version()`;
    return data;
}
