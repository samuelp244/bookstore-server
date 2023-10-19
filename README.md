# Backend Documentation

This backend for the project is developed using Node.js with Express and MongoDB. Follow these steps to set up the backend server locally on your development environment.

## Prerequisites

Before setting up the backend, make sure you have the following prerequisites installed on your system:

1. **Node.js**: Download and install Node.js from [https://nodejs.org/](https://nodejs.org/).
2. **npm**: npm is typically included with Node.js installation, so you don't need to install it separately.
3. **TypeScript**: You can install TypeScript globally using npm with the following command:

    ```bash
    npm install -g typescript
    ```

4. **ts-node**: Install ts-node globally to run TypeScript files directly:

    ```bash
    npm install -g ts-node
    ```

## Getting Started

Follow these steps to set up the backend server locally:

1. **Clone the Repository**: Begin by cloning the project's backend repository to your local machine.

    ```bash
    git clone https://github.com/samuelp244/bookstore-server.git
    ```

2. **Install Dependencies**: Navigate to the backend project directory and install the required dependencies using npm.

    ```bash
    cd bookstore-server
    npm install
    ```

3. **Create Environment File**: Create a `.env` file at the root of your backend project directory. You can copy the `.env.example` file if available and customize it for your specific environment.

4. **Configure Environment Variables**: In the `.env` file, add the following environment variables:

    - `PORT`: The port on which the server will run.
    - `ACCESS_TOKEN_SECRET`: A secret key for generating access tokens.
    - `REFRESH_TOKEN_SECRET`: A secret key for generating refresh tokens.
    - `MONGO_URI`: The MongoDB connection URI.
    - `FRONTEND_URL`: The URL of your frontend application for CORS (Cross-Origin Resource Sharing). (This is optional, mainly used for deployment)

        ```plaintext
        PORT=4000
        ACCESS_TOKEN_SECRET=your-access-token-secret
        REFRESH_TOKEN_SECRET=your-refresh-token-secret
        MONGO_URI=your-mongodb-uri
        FRONTEND_URL=http://localhost:3000
        ```

5. **Run the Server**: Start the backend server using the following command:

    ```bash
    npm run dev
    ```

    This command will run the server using nodemon, which will automatically restart the server when changes are made.

6. **Comments for Clarity**: In this project, comments have been added to important controllers, functions, and other components to enhance code clarity.


