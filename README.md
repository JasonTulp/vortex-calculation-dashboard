# Vortex Data Dashboard

A MongoDB data dashboard for viewing various collections from the Vortex database. This application allows you to view and filter data from multiple collections:

- Signed Effective Balances
- Effective Balances
- Chilled Accounts
- Stakers
- Balances

## Features

- Dynamically select MongoDB database to query
- Filter by account ID
- Pagination support for large datasets
- Responsive UI built with Next.js, TypeScript, and Tailwind CSS

## Prerequisites

- Node.js 16+ 
- MongoDB instance with appropriate collections

## Setup

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory based on the `.env.local.example` file:

```
MONGODB_URI=mongodb://username:password@hostname:port/
```

Replace with your actual MongoDB connection string, but without specifying a database. The database will be specified through the UI.

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Using the Dashboard
### Account Filtering
- Enter an account ID (0x followed by 40 hex characters) to filter all data sections
- This will limit results to only show data for the specified account

## MongoDB Collections

The application is designed to work with the following MongoDB collections in your selected database:

- `signedEffectiveBalances` - Signed effective balance data
- `effectiveBalances` - Effective balance data
- `chilled` - Chilled account records
- `stakers` - Staker records
- `balances` - Balance records

## Building for Production

```bash
pnpm run build
```

Then start the production server:

```bash
pnpm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
