# MealSpin 🍽️

A kid-friendly meal decision app with an interactive spin wheel. Perfect for families who can't decide what to eat!

## Features

- 🎯 **Spin Wheel** - Interactive animated wheel that lands on random meals
- 🔍 **Smart Filters** - Filter by prep time, picky eater mode, and allergies
- 📋 **Recipe Details** - Complete ingredients, instructions, and nutrition info
- ❤️ **Favorites** - Save your family's favorite meals
- 📅 **Weekly Planner** - Plan meals for the week ahead
- 🌙 **Dark Mode** - Eye-friendly dark theme
- 📱 **Mobile-First** - Optimized for mobile devices with big touch targets

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Database**: Neon Postgres
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/L8ton-crypto/meal-spin.git
   cd meal-spin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Neon database URL to `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
   ```

4. **Initialize the database**
   ```bash
   # The database will be automatically initialized on first API call
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

```sql
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prep_time INTEGER NOT NULL DEFAULT 30,
  cook_time INTEGER NOT NULL DEFAULT 30,
  servings INTEGER NOT NULL DEFAULT 4,
  image_url VARCHAR(500),
  is_picky_eater_friendly BOOLEAN DEFAULT false,
  allergens TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  nutrition JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

- `GET /api/meals` - Get all meals with optional filters
- `POST /api/meals/random` - Get a random meal based on filters
- `POST /api/init` - Initialize database (development only)

## Deployment

This project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add the `DATABASE_URL` environment variable in Vercel dashboard
3. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own family meal planning!

---

Built with ❤️ for families who want to make mealtime decisions fun and easy.