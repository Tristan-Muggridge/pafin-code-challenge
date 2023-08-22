# User API - Backend Data Handling

Good morning/afternoon! <br>
This application is a RESTful API developed using TypeScript and Node.js that allows users to manage user data in a PostgreSQL database. The API supports CRUD operations for user resources and is secured using JWT authentication.

To run the application, you will need to have Node.js and a running PostgreSQL database installed on your machine. You will also need to create a `.env` file in the root directory of the project with the following environment variables:

```
DATABASE_URL=   your_database_url
DB_TYPE=        "postgres" | "memory"
PORT=           your_port: number
JWT_SECRET=     your_jwt_secret: string
ENVIRONMENT=    "development" | "production"
```

Please don't hesitate to utilise the following example `.env` file:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
DB_TYPE=postgres
PORT=3000
JWT_SECRET=secret
ENVIRONMENT=development
```

Once you have created the `.env` file, you can run the application using the following commands:

```bash
npm install
npm start
```

Please note: the application will not create any database tables or seed any data as requested in the challenge specification. This is because the database schema and tables have already been created. However, if you would like to create the database tables and seed the database with data, you can run the following commands after providing a valid DATABASE_URL in the `.env` file:

```bash
npm prisma-setup
```

## Usage:

### Authentication

Please be aware, all routes except for /login are protected by JWT authentication. 
<br> To authenticate, you will need to provide a valid JWT token in the Authorization header of your request. 
<br> You can obtain a valid JWT token by sending a POST request to the /login endpoint with a valid username (email) and password of a user already in the database, in the Authorization header of your request.
<br> If you would like to test the API without having a user already in the database, please use the following route to create a user:

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

After create the user, you can use the following route to authenticate:

### POST /auth/login

Authenticates a user using basic authentication and returns a JWT token.

#### Response Body

```json
{
  "token": "string"
}
```

After recieving this token, you can use it to authenticate your requests by providing it in the authorization header of your request.

<br>The token will be valid for 1 hour.
<br>The token can be invalidated (until the server is restarted, as currently keeping track in memory) by sending a POST request to the /logout endpoint with the token in the authorization header of your request.


## The API supports the following endpoints:

#### POST /users

Creates a new user.

#### Request Body:

```json
{
    "id": "string",
    "name": "string",
    "email": "string",
}
```

#### Response Body:

```json
{
    "status": "string",
    "data": {
        "id": "string",
        "name": "string",
        "email": "string",
    }
}
```

### GET /users ( http://localhost:3000/api/users?skip=3&sort=email&order=desc&take=1 )

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

### PUT /users/:id

Updates a user by id.

#### Request Body:

```json
{
  "name": "string",
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


### POST /users

Creates either a single user, or a batch of users.

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
    }
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
            [string | number] : {
                "name": string[],
                "email": string[],
                "password": string[]
            }
        }
    }
}
```