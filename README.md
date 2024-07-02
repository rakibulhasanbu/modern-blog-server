<h2 align="center"> Course review auth server</h2>

## Course review auth app server Live Link

### https://course-review-auth-liart.vercel.app/

## Course review auth app server Postman Documentation link

### https://documenter.getpostman.com/view/19464921/2s9YkuYdZj

## Run the server application locally

If you want to run the server locally on your computer, firstly clone this project, go to the right path and open to the terminal then run `npm install` and then run the command `npm run build` to convert the TypeScript code to JavaScript code. And start the server with `npm run start:dev` command.

## Server Documentation

- This server is created to manage users and create courses.
- New users are created here, and all users in the database can be seen.
- Users can login with their username and password and take a token from the server.
- Without token user cannot access many route that is protected.
- Admin can create a category provide token and get all category are open for all users.
- Admin can create a course and update the course, update course is dynamically working.
- Users can create a review not by admin and all user are see the best course and specific course with reviews.

## Server API

### 1. User Registration

Endpoint: POST `/api/auth/register`

### 2. User Login

Endpoint: POST `/api/auth/login`

### 3. Change Password

Endpoint: POST `/api/auth/change-password`

### 4. Create a Course (Only Admin can do this)\*\*

Endpoint: POST `/api/courses`

### 5. Get Paginated and Filtered Courses.

Endpoint: GET `/api/courses`

### 6. Create a Category (Only Admin can do this)\*\*

Endpoint: POST `/api/categories`

### 7. Get All Categories\*\*

Endpoint: GET `/api/categories`

### 8. Create a Review (Only the user can do this)\*\*

Endpoint: POST `/api/reviews`

### 9. Update a Course (Only Admin can do this)\*\*

Endpoint: PUT `/api/courses/:courseId`

### 10. Get Course by ID with Reviews\*\*

Endpoint: GET `/api/courses/:courseId/reviews`

### 11. Get the Best Course Based on Average Review (Rating)\*\*

Endpoint: GET `/api/course/best`
