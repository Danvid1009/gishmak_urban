# Gishmak Urban Dictionary Clone

A modern Urban Dictionary-style web application built with Next.js, Supabase, and Tailwind CSS.

## Features

- Submit new slang terms and definitions
- View and search existing terms
- Upvote/downvote definitions
- Responsive design with Tailwind CSS
- Serverless architecture with Supabase

## Tech Stack

- **Frontend**: Next.js 14
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gishmak-urban.git
   cd gishmak-urban
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

4. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Set up the database:
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create terms table
   create table terms (
     id uuid default uuid_generate_v4() primary key,
     word text not null unique,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Create definitions table
   create table definitions (
     id uuid default uuid_generate_v4() primary key,
     term_id uuid references terms(id) on delete cascade,
     user_id uuid,
     content text not null,
     upvotes integer default 0,
     downvotes integer default 0,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Set up Row Level Security (RLS)
   alter table terms enable row level security;
   alter table definitions enable row level security;

   -- Create policies to allow all operations
   create policy "Allow all operations on terms" on terms
     for all
     using (true)
     with check (true);

   create policy "Allow all operations on definitions" on definitions
     for all
     using (true)
     with check (true);
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
Last updated: 2024 