# User API - Backend Data Handling

Good morning/afternoon! <br>
This application is a RESTful API developed using TypeScript and Node.js that allows users to manage user data in a PostgreSQL database. The API supports CRUD operations for user resources and is secured using JWT authentication.

To run the application, you will need to have Node.js installed on your machine. You will also require an active PostgreSQL server, and a connection string to this server.
Default values have been provided in code for the env variables, however, you will need to provide a valid DATABASE_URL in the `.env` file in order to connect to your PostgreSQL server. If you'd like to change any of the env variables, please do so in the `.env` file.

```
DATABASE_URL=   your_database_url
DB_TYPE=        "prisma" | "memory"
PORT=           your_port: number
JWT_SECRET=     your_jwt_secret: string
ENVIRONMENT=    "development" | "production"
```

Please don't hesitate to utilise the following example `.env` file:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
DB_TYPE="prisma"
PORT="3000"
JWT_SECRET="secret"
ENVIRONMENT="development"
```

Once you have created the `.env` file, you can run the application using the following commands:

```bash
npm ci
npm start
```

Please note: the application will not create any database tables or seed any data as requested in the challenge specification. This is because the database schema and tables have already been created. However, if you would like to create the database tables, you can run the following commands after providing a valid DATABASE_URL in the `.env` file:

```bash
npm run prisma-setup
```

## Testing

The application has been tested using the following tools:

| Tool | Purpose |
| ---- | ------- |
| Postman | Used to test the API endpoints |
| Mocha | Used to run unit tests |
| Chai | Used to write unit tests |
| Supertest | Used to write unit tests |

To run the unit tests, please run the following command:

```bash
npm test
```

Please note: some tests will fail if users exist in the database with an email which is being used in the tests. This is because the email field is unique in the database schema. If you would like to run the tests without any errors, please ensure that the database is empty before running the tests.

## Packages used:
| Package | Purpose |
| ------- | ------- |
| express | Web framework for Node.js |
| prisma  | ORM for Node.js |
| crypto  | Used to hash passwords (bcrypt would provide more secure hashing for a real-world project) |
| jsonwebtoken | Used to generate and verify JWT tokens |
| dotenv | Used to load environment variables from a .env file |
| cors | Used to enable CORS for the API |
| express-async-errors | Used to handle async errors in express middleware |
| chai | Used for unit testing |
| mocha | Used for unit testing |
| supertest | Used for unit testing |
| typescript | Used to add type safety to JavaScript |

## Database Schema:
| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string | Unique identifier for the user generated on creation of a record using uuid4 standard |
| name | string | Name of the user |
| email | string | Email address of the user (unique) |
| password | string | Password of the user (hashed) |

## Usage:

### Authentication

Please be aware, all routes except for /login are protected by JWT authentication. 
<br> To authenticate, you will need to provide a valid JWT token in the Authorization header of your request. 
<br> You can obtain a valid JWT token by sending a POST request to the /login endpoint with a valid username (email) and password of a user already in the database, in the Authorization header of your request.
<br> If you would like to test the API without having a user already in the database, please use the following route to create a user available in DEVELOPMENT and TESTING environment modes (set via .env file):

#### GET /create-admin-user

Creates a user with the following credentials:
| Parameter | Value |
| --------- | ----- |
| email     | admin |
| password  | admin |

#### Request Response

```json
{
    "status": "success",
    "data": {
        "user": {
            "id": "string",
            "name": "string",
            "email": "string"
        }
    }
}
```

After creating the user, you can use the following route to authenticate:

### POST /auth/login

Authenticates a user using basic authentication and returns a JWT token.

#### Response Body

```json
{
    "status": "string",
    "data": {
        "token": "string"
    }
}
```

After recieving this token, you can use it to authenticate your requests by providing it in the authorization header of your request.

<br>The token will be valid for 1 hour.
<br>The token can be invalidated (until the server is restarted, as currently keeping track in memory) by sending a POST request to the /logout endpoint with the token in the authorization header of your request.


## The API supports the following endpoints:

### GET /users

Retrieves all users.

#### Query Parameters:

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| skip      | number (optional) | Skip n records at the beginning of the result set |
| take      | number (optional) | Take first n records from the beginning of the result set (ignoring the remainder) |
| sort      | string (optional) | Sort the result set by one of the following: id, name, email       |
| order     | string (optional) | Order the sorted result set in descending (desc) or ascending (asc)    |


#### Response Body:

```json
{
    "status": "string",
    "data": {
        "users": [
            {
                "id": "string",
                "name": "string",
                "email": "string",
            }
        ]
    },
    "currentPage": "number",
    "totalPages": "number",
    "count": "number",

}
```

### GET /users/:id

Retrieves a user by id.

#### Response Body:

```json
{
    "status": "string",
    "data": {
        "user": {
            "id": "string",
            "name": "string",
            "email": "string",
        }
    }
}
```

### POST /users

Creates either a single user, or a batch of users depending on request body sent.

#### Request Body (single user):

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
}
```

#### Request Body (batch of users):

```json
[
    {
        "id": "string",
        "name": "string",
        "email": "string",
    },
    {
        "id": "string",
        "name": "string",
        "email": "string",
    },
    ...
]
```

#### Response Body (single user):

```json
{
    "status": "string",
    "data": {
        "user": {
            "id": "string",
            "name": "string",
            "email": "string",
        }
    }
}
```

#### Response Body (batch of users):

```json
{
    "status": "string",
    "data": {
        "success": [
            {
                "id": "string",
                "name": "string",
                "email": "string",
            }
        ],
        "fail": {
            "email" : {
                "name": "string[]",
                "email": "string[]",
                "password": "string[]"
            }
        }
    }
}
```

### PATCH /users/:id

Updates a user by id. <br>
Can either provide all fields, or just the fields you wish to update.

#### Request Body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
or
```json
{
  "name": "string"
}
```
or
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response Body:

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
}
```

### DELETE /users/:id

Deletes a user by id.

#### Response Body:
```
No request body required.
```