# FXQL Parser API

A NestJS-based API for parsing and managing FXQL statements. This application validates FXQL inputs, ensures data integrity, and interacts with a PostgreSQL database using Prisma ORM.

## Features

- **FXQL Parsing**: Validates and parses FXQL statements, ensuring adherence to defined rules and constraints.
- **Data Persistence**: Stores FXQL data in a PostgreSQL database, handling upserts to maintain the latest values.
- **Validation**: Ensures currency codes are uppercase, values are numeric and within specified constraints, and proper formatting of FXQL statements.
- **Dockerized Deployment**: Easily deployable using Docker.
- **API Documentation**: Comprehensive API docs for easy integration and usage.

## Setup Instructions

### Prerequisites

- **Node.js**: Version 20.x
- **npm**: Version 8.x or higher
- **PostgreSQL**: Version 15.x or higher
- **Docker**: For containerized deployment

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Stefanpgr/fxql-parser
   cd fxql-parser
   ```
2. **Install Dependencies**

   ```bash
   npm install
   ```
3. **Configure Environment Variables**

   - Create a `.env` file in the root directory:
     ```env
     DATABASE_URL=postgresql://user:password@localhost:5432/fxql
     PORT=3000
     ```
4. **Run Database Migrations**

   ```bash
   npx prisma migrate dev
   ```
5. **Start the Application**

   ```bash
   npm run start:dev
   ```

   - The API will be accessible at `http://localhost:3000`.

## API Documentation

### Base URL

* **Production** :[ https://fxql-parser-z7qu.onrender.com](https://fxql-parser-z7qu.onrender.com)
* **Development** : `http://localhost:3000`

### Documentation URL

* **Swagger Documentation** : [https://fxql-parser-z7qu.onrender.com/docs](https://fxql-parser-z7qu.onrender.com/docs)

## Local Development

### Running Locally

1. **Ensure PostgreSQL is Running**

   - Make sure your PostgreSQL server is up and accessible using the `DATABASE_URL` provided in your `.env` file.
2. **Start the Development Server**

   ```bash
   npm run start:dev
   ```

   - This runs the application in development mode with hot-reloading.

### Testing

1. **Run Unit Tests**

   ```bash
   npm run test
   ```
2. **Run End-to-End Tests**

   ```bash
   npm run test:e2e
   ```

## Environment Variables

The application relies on the following environment variables:

- `DATABASE_URL`: Connection string for the PostgreSQL database.
  - **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- `PORT`: Port on which the application runs (default is `3000`).

**Example `.env` File**:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fxql
PORT=3000
```



## Assumptions and Design Decisions

1. **Duplicate Currency Pairs** :

* if the same currency pair appears multiple times, the latest block is saved. This is implemented using a `Map` to ensure unique keys and to optimize for lookups. The key in the map (`${parsedBlock.sourceCurrency}-${parsedBlock.destinationCurrency}`) ensures that only the latest block for each currency pair is retained:
* Earlier entries for the same currency pair are replaced, reducing memory usage.
* No need to keep a separate list of all parsed blocks for comparison.

2. **Validation Rules** :

* I thought of using Node.js Stream Instead of loading the entire FXQL input into memory, parse it line-by-line using Node.js streams. This is useful for large inputs, as it reduces memory usage and improves efficiency. However it was a bit more complex so I opted for  a simpler yet efficient solution (Regular Expression) for parsing which still reduces memory usage by avoiding assigning the array to a variable which would load it into memory, so the parsing is done without first loading it in memory. By doing this, I am able to squeeeze some performace (hopefully).

**- Block Formatting** :

* Each block must start with a valid currency pair in the format `CURR1-CURR2 {`.
* The opening brace `{` must directly follow the currency pair, separated by a single space.
* The closing brace `}` must be on its own line.
* using` this.parseBlock(block.trim(), index + 1);` I was able to process the blocks incrementally to ensure that only the currently processed block occupies memory.

This formatting type helps structure the statements into blocks for easy processing.

3. **Database Upsert** :

* Batch upsert is used to optimize database writes.The `batchUpsert` method accepts an array of entries and processes them in parallel using `Promise.all`. By using `Promise.all`, all `upsert` operations run concurrently, improving performance for large entries, in this case at most 1000.

4. **Graceful Degradation** :

* If a single block fails validation, it does not affect other valid blocks in the request.
* Only the valid blocks are processed and saved.
