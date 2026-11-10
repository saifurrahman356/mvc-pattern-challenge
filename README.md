# MVC Pattern Challenge – Blog Management System

A server-side rendered blog application built with **Bun, TypeScript, Express 5, Nunjucks and SQLite**. The project demonstrates the Model–View–Controller (MVC) pattern and includes a public blog, an administration area and a JSON REST API.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database setup](#database-setup)
- [Run the application](#run-the-application)
- [How to use the application](#how-to-use-the-application)
- [Application routes](#application-routes)
- [REST API](#rest-api)
- [Project structure](#project-structure)
- [How the MVC architecture works](#how-the-mvc-architecture-works)
- [Data model](#data-model)
- [Development commands](#development-commands)
- [Important implementation notes](#important-implementation-notes)
- [Troubleshooting](#troubleshooting)

## Overview

The application is a small blog/content-management system (CMS). Visitors can browse published articles, open individual posts, and view informational pages. An administrator can sign in to a protected area to create, edit, and delete blog posts.

The same blog data is also exposed through a REST API under `/api`. Blog records are stored in a local SQLite database, so changes persist between application restarts.

The project uses MVC to separate responsibilities:

- **Model:** reads and writes blog data in SQLite.
- **View:** renders HTML using Nunjucks templates.
- **Controller:** handles HTTP requests, validates input, calls models and selects the response.
- **Routes:** connect URL paths and HTTP methods to controller functions.
- **Middleware:** handles request parsing and protects administrator routes.

## Features

### Public website

- Blog homepage at `/`.
- Individual blog post pages at `/posts/:slug`.
- Filter posts by author.
- Sort posts by newest or oldest.
- Paginate results, displaying two posts per page.
- About, Contact and sample-post pages.
- Responsive layout based on the Clean Blog theme.

### Administration

- Password-based administrator login at `/login`.
- Protected administration area at `/admin`.
- List and manage existing posts.
- Create a new post.
- Edit an existing post.
- Delete a post.
- Validate required fields and prevent duplicate slugs.
- Sanitize submitted HTML content before saving it.

### REST API

- Retrieve a paginated list of posts.
- Create a post.
- Update a post by slug.
- Delete a post by slug.

## Technology stack

| Technology | Purpose |
|---|---|
| Bun | JavaScript/TypeScript runtime and package manager |
| TypeScript | Static typing for application code |
| Express 5 | HTTP server, routing and middleware |
| Nunjucks | Server-side HTML templating |
| SQLite | Lightweight relational database |
| `sqlite` | Promise-based database interface |
| `sqlite3` | SQLite driver |
| `sanitize-html` | Sanitizes HTML submitted as blog content |
| `cookie-parser` | Reads the administrator authentication cookie |
| Quill | Rich-text editor used by the admin form |
| Bootstrap / Clean Blog | Front-end styling and responsive layout |

## Requirements

Install the following software before setting up the project:

1. **Bun** – required by the project's scripts.
2. **SQLite command-line tools** – the development seed script invokes the `sqlite3` executable.
3. **Git** – optional, but useful for source control.
4. A modern browser.

Node.js is not required to run the scripts as currently written, because the scripts invoke Bun. The project includes npm and Bun lockfiles; use one package manager consistently. The instructions below use Bun.

Check your installations:

```bash
bun --version
sqlite3 --version
git --version
```

If `sqlite3 --version` is not recognised, install the SQLite command-line tools for your operating system and ensure the `sqlite3` command is available in your terminal's `PATH`.

## Installation

### 1. Extract the project

Extract `mvc-pattern-challenge.zip`, then open the project directory:

```bash
cd mvc-pattern-challenge
```

Run subsequent commands from this directory. The application expects the `db` and `views` directories to be relative to the project root.

### 2. Install dependencies

```bash
bun install
```

This installs the dependencies declared in `package.json`.

### 3. Configure environment variables

Create or update a `.env` file in the project root:

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-this-with-a-long-random-password
PORT=3000
NODE_ENV=development
```

Bun automatically loads a project-root `.env` file. Keep real credentials private and do not commit `.env` to source control. Use a strong, unique password.

**Current implementation detail:** the HTML login controller checks `ADMIN_PASSWORD`; it does not currently check `ADMIN_USERNAME`. The `ADMIN_USERNAME` variable is used by the alternative Basic Authentication middleware, which is not enabled in `app.ts`.

### 4. Initialise the database

The project provides a SQL seed file at `db/seeddb.sql`. It creates the `blog_entries` table and inserts three example posts.

To create/reset the database and insert the sample records:

```bash
bun run db:seed
```

This command uses the SQLite CLI and executes:

```bash
sqlite3 db/blog.db < db/seeddb.sql
```

**Warning:** the seed SQL starts by dropping the existing `blog_entries` table. Running the seed command again deletes the current blog posts and replaces them with the sample data. Back up `db/blog.db` before reseeding if you want to keep your content.

## Configuration

The application reads these environment variables:

| Variable | Purpose | Default / current behaviour |
|---|---|---|
| `ADMIN_USERNAME` | Username for the alternative Basic Auth middleware | No application default |
| `ADMIN_PASSWORD` | Password checked by the login controller | Must be configured |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | Controls the cookie's `secure` option | Set to `production` when deployed |

The database path is currently defined in `src/db/database.ts` as `db/blog.db`, relative to the process working directory.

## Database setup

The database file is:

```text
db/blog.db
```

The seed script creates the following table:

### `blog_entries`

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER | Auto-incrementing primary key |
| `slug` | TEXT | Unique URL-friendly identifier |
| `title` | TEXT | Post title |
| `teaser` | TEXT | Short summary displayed in previews |
| `author` | TEXT | Post author |
| `createdAt` | INTEGER | Creation date as a Unix timestamp in seconds |
| `image` | TEXT | Image filename |
| `content` | TEXT | Sanitized HTML body |

The database model in `src/models/postModelDB.ts` performs the SQL operations. `src/db/database.ts` opens the connection and ensures a table exists.

## Run the application

### Start in development mode

```bash
bun run dev
```

The current `dev` script first runs the database seed command and then starts Bun in watch mode:

```json
"dev": "bun run db:seed && bun --watch src/app.ts"
```

Bun watch mode restarts the application when relevant source files change.

**Important:** because `db:seed` drops and recreates the posts table, every `bun run dev` resets the blog data. If you want to preserve posts while developing, change the development script so it starts the server without reseeding, and run `bun run db:seed` only when you intentionally want to reset the database.

### Open the website

Once the server has started, visit:

```text
http://localhost:3000
```

If you configured a different `PORT`, use that port instead.

### Stop the server

Press `Ctrl + C` in the terminal.

The application listens for `SIGINT` and `SIGTERM` and closes the SQLite connection during shutdown.

### Production/start script note

The current `package.json` contains:

```json
"start": "bun src/index.ts"
```

However, the uploaded project has `src/app.ts`, not `src/index.ts`. Therefore, the current `start` script will not work unless `src/index.ts` is added. To run the existing entry point directly, use:

```bash
bun src/app.ts
```

You can also update the script to:

```json
"start": "bun src/app.ts"
```

## How to use the application

### 1. Browse the blog

Open `http://localhost:3000/`.

The homepage displays posts from the SQLite database. Each preview links to its full post page.

### 2. Filter posts by author

The homepage supports the `author` query parameter. For example:

```text
http://localhost:3000/?author=Peter
```

The filter uses a case-insensitive partial match.

### 3. Sort posts

Use the `sort` query parameter:

```text
http://localhost:3000/?sort=newest
http://localhost:3000/?sort=oldest
```

### 4. Navigate between pages

The page size is configured as `PAGE_SIZE = 2` in `src/types.ts`.

Use the `page` query parameter:

```text
http://localhost:3000/?page=1
http://localhost:3000/?page=2
```

Filtering, sorting and pagination can be combined:

```text
http://localhost:3000/?author=Peter&sort=oldest&page=1
```

### 5. Sign in as administrator

Open:

```text
http://localhost:3000/login
```

Enter the password configured as `ADMIN_PASSWORD` in `.env`.

After successful login, the application sets an `admin` cookie and redirects to `/admin`.

### 6. Manage blog posts

From `/admin`:

- Select **Create Post** to add a post.
- Select **Edit** beside a post to update it.
- Select **Delete** to remove a post.

The form requires a title, author, teaser and content. The application creates a URL slug from the title. For example:

```text
A Day in Munich
```

becomes:

```text
a-day-in-munich
```

A duplicate slug is rejected.

### 7. View an individual post

A post can be opened using its slug:

```text
http://localhost:3000/posts/a-day-in-munich
```

### 8. Use the REST API

The JSON API is available under `/api`. See the [REST API](#rest-api) section for endpoints and example requests.

## Application routes

### Public routes

| Method | URL | Description |
|---|---|---|
| GET | `/` | Blog homepage |
| GET | `/posts/:slug` | View an individual post |
| GET | `/about` | About page |
| GET | `/contact` | Contact page |
| GET | `/example-post` | Static sample post |

The homepage accepts optional `author`, `sort` and `page` query parameters.

### Authentication routes

| Method | URL | Description |
|---|---|---|
| GET | `/login` | Display administrator login form |
| POST | `/login` | Validate the submitted password |

### Admin routes

All `/admin` routes are protected by `requireAdmin` middleware.

| Method | URL | Description |
|---|---|---|
| GET | `/admin` | List posts |
| GET | `/admin/posts/new` | Display the create-post form |
| POST | `/admin/posts` | Create a post |
| GET | `/admin/posts/:slug/edit` | Display the edit form |
| POST | `/admin/posts/:slug` | Update a post |
| POST | `/admin/posts/:slug/delete` | Delete a post |

The admin listing also accepts `author`, `sort` and `page` query parameters.

## REST API

The API router is mounted at `/api`.

### Get all posts

```http
GET /api/posts
```

Optional query parameters:

| Parameter | Example | Description |
|---|---|---|
| `author` | `Peter` | Case-insensitive partial author filter |
| `sort` | `oldest` | Use `oldest` or `newest` |
| `page` | `2` | Page number |

Example:

```bash
curl "http://localhost:3000/api/posts?author=Peter&sort=newest&page=1"
```

The response contains `posts`, `totalPages` and `currentPage`.

### Create a post

```http
POST /api/posts
Content-Type: application/json
```

Example request body:

```json
{
  "title": "Learning the MVC Pattern",
  "author": "Alex Morgan",
  "teaser": "A short introduction to MVC architecture.",
  "content": "<p>MVC separates an application into three responsibilities.</p>"
}
```

Example:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Learning the MVC Pattern","author":"Alex Morgan","teaser":"A short introduction to MVC architecture.","content":"<p>MVC separates an application into three responsibilities.</p>"}'
```

A successful request returns HTTP `201` and the created post slug.

### Update a post

```http
PUT /api/posts/:slug
Content-Type: application/json
```

Example:

```bash
curl -X PUT http://localhost:3000/api/posts/learning-the-mvc-pattern \
  -H "Content-Type: application/json" \
  -d '{"title":"Understanding MVC","teaser":"An updated summary."}'
```

The controller supports partial updates: omitted fields retain their existing values. If the title changes, the slug is regenerated.

### Delete a post

```http
DELETE /api/posts/:slug
```

Example:

```bash
curl -X DELETE http://localhost:3000/api/posts/learning-the-mvc-pattern
```

A successful deletion returns HTTP `204 No Content`.

### API response and validation notes

- Required fields for creation: `title`, `author`, `teaser` and `content`.
- HTML content is passed through `sanitize-html`.
- Slugs are checked before update and delete operations.
- Duplicate slugs are rejected.
- A missing post returns a not-found response for the relevant API operation.

The current create API's duplicate-slug branch uses an HTML form response rather than a JSON response. This should be made consistent if the API is intended for external clients.

## Project structure

```text
mvc-pattern-challenge/
│
├── db/
│   ├── blog.db                 # SQLite database file
│   └── seeddb.sql              # Creates table and inserts sample posts
│
├── public/
│   └── js/
│       ├── editor.js           # Rich-text editor behaviour
│       └── scripts.js          # Front-end scripts
│
├── src/
│   ├── app.ts                  # Express application entry point
│   ├── types.ts                # Shared TypeScript types and page-size setting
│   │
│   ├── controllers/
│   │   ├── aboutController.ts
│   │   ├── adminPostController.ts
│   │   ├── apiPostController.ts
│   │   ├── contactController.ts
│   │   ├── examplePostController.ts
│   │   ├── loginController.ts
│   │   ├── postController.ts
│   │   ├── sanitizeContent.ts
│   │   └── utils.ts
│   │
│   ├── db/
│   │   └── database.ts         # Opens, exposes and closes SQLite connection
│   │
│   ├── middleware/
│   │   ├── basicAuth.ts        # Alternative HTTP Basic Authentication
│   │   └── requireAdmin.ts     # Protects admin routes using the cookie
│   │
│   ├── models/
│   │   ├── postModelDB.ts      # Active SQLite data-access model
│   │   ├── postModelMemory.ts  # Alternative in-memory model
│   │   └── utils.ts            # Slug and sample-data helpers
│   │
│   ├── routes/
│   │   ├── aboutRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── apiRoutes.ts
│   │   ├── contactRoutes.ts
│   │   ├── examplePostRoutes.ts
│   │   ├── loginRoutes.ts
│   │   └── postRoutes.ts
│   │
│   ├── assets/                 # Images and favicon
│   └── css/
│       └── styles.css
│
├── views/
│   ├── layouts/
│   │   └── _baseLayout.html   # Shared page layout
│   ├── partials/
│   │   ├── formField.html     # Reusable form-field macro
│   │   └── pageHeader.html
│   ├── admin/
│   │   ├── admin.html         # Admin post listing
│   │   ├── adminForm.html     # Create/edit form
│   │   └── post.html          # Individual post content
│   ├── errors/
│   │   └── error.html
│   ├── index.html
│   ├── login.html
│   ├── about.html
│   ├── contact.html
│   ├── postPreview.html
│   └── postExample.html
│
├── .env                       # Local environment variables (do not commit)
├── .gitignore
├── package.json
├── bun.lock
├── tsconfig.json
└── README.md
```

## How the MVC architecture works

A typical request flows through the application in this order:

```text
Browser / API Client
        |
        v
   Express app.ts
        |
        v
   Route definition
        |
        v
   Controller
        |
        v
   Model (postModelDB)
        |
        v
   SQLite database
        |
        v
   Controller
      /     \
     v       v
 Nunjucks   JSON
 Template  Response
     |
     v
 HTML sent to browser
```

### 1. Model

The model is responsible for accessing and changing application data.

The active model is `src/models/postModelDB.ts`. It contains functions such as:

- `getPostBySlug()` – finds one post by its slug.
- `getAllPosts()` – filters, sorts and paginates posts.
- `createBlogEntry()` – inserts a new post.
- `updatePost()` – updates an existing post.
- `deletePost()` – deletes a post.

The model uses `getDB()` from `src/db/database.ts` to access the SQLite connection.

### 2. View

Views define the HTML presented to users. They are stored in `views/` and rendered by Nunjucks.

Examples:

- `index.html` renders the blog homepage.
- `postPreview.html` renders a post preview.
- `admin/admin.html` renders the administration list.
- `admin/adminForm.html` renders the create/edit form.
- `layouts/_baseLayout.html` provides the shared layout.
- `partials/formField.html` provides a reusable Nunjucks macro.

### 3. Controller

Controllers receive requests, coordinate application logic and return responses.

For example, `postController.showPosts()`:

1. Reads the author, sort and page query parameters.
2. Calls `getAllPosts()` in the model.
3. Formats post dates.
4. Passes the resulting data to `index.html`.
5. Sends the rendered HTML response.

The API controller follows a similar process but returns JSON instead of rendering an HTML page.

### 4. Routes

Routes map an HTTP method and URL to a controller function.

For example, `src/routes/postRoutes.ts` maps:

```ts
router.get("/", postController.showPosts);
router.get("/posts/:slug", postController.showPost);
```

### 5. Middleware

Middleware runs between receiving a request and executing the final route handler.

- `express.urlencoded()` parses HTML form submissions.
- `express.json()` parses JSON request bodies.
- `cookieParser()` makes cookies available through `req.cookies`.
- `requireAdmin` checks the administrator cookie before allowing access to `/admin`.

## Data model

The shared `BlogEntry` interface in `src/types.ts` describes a blog post:

```ts
export interface BlogEntry {
  id: number;
  title: string;
  slug: string;
  image: string;
  author: string;
  createdAt: number;
  teaser: string;
  content: string;
}
```

`createdAt` is stored as a Unix timestamp in seconds and converted to a readable date by the controller before rendering.

`PAGE_SIZE` is set to `2`. This controls how many posts are returned per page.

## Development commands

| Command | Purpose |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Seed/reset the database and start the app in watch mode |
| `bun run db:seed` | Drop/recreate the posts table and insert sample posts |
| `bun run typecheck` | Run TypeScript type checking without emitting files |
| `bun src/app.ts` | Run the current application entry point directly |

The `start` script in the uploaded `package.json` currently points to a missing `src/index.ts`; see the production/start-script note above.

## Important implementation notes

The following are observations from the uploaded source code, not assumptions about intended behaviour. They are worth addressing before using the application with real users or deploying it.

1. **Development startup resets data.** `bun run dev` runs `db:seed`, and the seed SQL drops the posts table. Separate database initialisation from ordinary application startup.
2. **The `start` script points to a missing file.** The actual entry point is `src/app.ts`.
3. **The login controller logs passwords.** It currently logs both the submitted password and configured administrator password. Remove these log statements immediately; credentials must never be written to logs.
4. **The admin cookie is not a secure authentication token.** `requireAdmin` only checks whether the cookie value equals the literal string `true`. A client can forge that cookie. Use a proper session or signed authentication token, and implement logout.
5. **The login only checks a password.** The current form and login controller do not validate `ADMIN_USERNAME`, despite that variable existing in `.env`.
6. **The database schema definitions differ.** The seed SQL creates a unique `slug` column and an integer timestamp. The fallback table definition in `connectDB()` does not define `slug` and declares `createdAt` as `TEXT`. Keep both schema definitions consistent, preferably by using migrations or one canonical schema.
7. **Database connection startup should be awaited.** `connectDB()` is started before `app.listen()`, but the server does not wait for the connection promise to resolve. Start listening only after a successful database connection.
8. **Pagination offset should use the clamped page.** `getAllPosts()` calculates the offset before clamping the requested page to the available range. Calculate the offset after determining `currentPage`.
9. **API errors should consistently return JSON.** The duplicate-slug branch in `apiPostController.createPost()` currently renders an HTML page. Return a JSON error for API clients.
10. **Admin and API security need review.** The admin cookie is not a trustworthy access-control mechanism, and the API write routes are not protected by the admin middleware. Add appropriate authentication and authorisation before exposing write operations.
11. **Add CSRF protection and rate limiting.** Cookie-authenticated admin actions should be protected against cross-site request forgery. Login attempts should also be rate-limited.
12. **The current project contains a `.env` file.** Do not distribute real credentials or commit secrets. Keep `.env` local and provide a safe `.env.example` with placeholders.

## Troubleshooting

### `sqlite3: command not found`

Install the SQLite command-line tools and verify that `sqlite3` is available in your terminal's `PATH`.

### `Database not connected`

The model calls `getDB()`, which throws if `connectDB()` has not completed. Ensure the database connection is awaited before accepting requests.

### `no such column: slug`

The table may have been created using the fallback schema in `database.ts` rather than the schema in `seeddb.sql`. Back up any important data, then initialise the database using the seed script, or update the schema definitions to match.

### Admin page redirects to login

Open `/login` and sign in using the configured `ADMIN_PASSWORD`. Check that cookies are enabled in your browser. For production, replace the current plain cookie check with proper session-based authentication.

### Changes disappear after restarting development

Check whether the application was started with `bun run dev`. That command reseeds the database and removes existing posts. Start the app without reseeding when you want to preserve data.

### `Cannot find module .../src/index.ts`

The current `start` script references a file that is not present. Run `bun src/app.ts` or correct the script in `package.json`.

---

## Project status

This project is a learning-oriented MVC blog application. It demonstrates separation of routes, controllers, models and views, database access, server-side rendering, form handling, pagination, basic authentication flow and REST endpoints.

Before production use, address the security and database consistency issues listed above.
