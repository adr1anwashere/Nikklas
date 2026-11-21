# Nikllas: Find your study people.

Nikllas is a mobile-friendly study-group finder built for Indonesian university students to post and join course-based study sessions.

## Quick Setup (Under 10 Steps)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a Supabase project:**
   Go to [supabase.com](https://supabase.com) and create a new project.

3. **Enable Anonymous Sign-ins:**
   In your Supabase project dashboard, navigate to **Authentication** -> **Sign In / Providers** and enable **"Allow anonymous sign-ins"**.

4. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase dashboard (Project Settings -> API).

5. **Run the database migration & enable Realtime:**
   Open Supabase **SQL Editor**, paste the contents of `supabase/migrations/20261121000000_initial_schema.sql`, and click **Run**.
   Then enable Realtime for live chat and meeting place updates:
   ```sql
   alter publication supabase_realtime add table public.messages;
   alter publication supabase_realtime add table public.meeting_places;
   ```

6. **Seed sample courses and demo sessions:**
   In Supabase **SQL Editor**, paste the contents of `supabase/seed.sql` and click **Run**.
   *(To reset demo data before a real pilot, run the 1-line cleanup command at the top of `supabase/seed.sql`)*.

7. **Start the development server:**
   ```bash
   npm run dev
   ```

8. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
