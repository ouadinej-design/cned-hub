import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://jakdhcqeouzjgjvihjkw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impha2RoY3Flb3V6amdqdmloamt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5Nzc5MzgsImV4cCI6MjEwNDU1MzkzOH0.8lT6HBZoPi2EcyoqvPMDYYb5eWQRgNQvZPDboyLIhUU"
);
