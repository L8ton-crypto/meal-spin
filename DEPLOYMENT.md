# MealSpin Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/L8ton-crypto/meal-spin ✅
- Vercel account connected to GitHub
- Neon Postgres database

## Deployment Steps

### 1. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import from GitHub: `L8ton-crypto/meal-spin`
4. Configure settings:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)

### 2. Set up Neon Database
1. Go to [Neon Console](https://console.neon.tech)
2. Create new database or use existing
3. Copy the connection string

### 3. Configure Environment Variables in Vercel
Add to Vercel project settings → Environment Variables:
```
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### 4. Test Deployment
1. Visit the deployed URL
2. Try spinning the wheel
3. Check that meals are loaded from database

## Database Schema
The database will be automatically initialized on first API call with:
- 10+ kid-friendly meals pre-seeded
- Proper schema for meals, ingredients, steps, nutrition

## Post-Deployment
1. Test all features:
   - Spin wheel functionality
   - Filters (prep time, picky eater, allergens)
   - Meal card display
   - Favorites (local storage)
   - Weekly planner UI

2. Share live URL with stakeholders

## Notes
- Database initialization happens automatically on first API call
- No manual database setup required
- All meals are pre-seeded with kid-friendly options