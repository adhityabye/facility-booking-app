# Facility Booking App

Welcome to the **Facility Booking App**! This mobile application, crafted with love using React Native and Expo, is designed to make booking facilities a breeze. Whether you're looking to reserve a meeting room, a sports court, or any other shared space, this app aims to provide a seamless and intuitive experience from start to finish.

## Try it Out!

Curious to see it in action? You can download the Android APK directly from this Google Drive:

[**Download APK and Video Explanation**](https://drive.google.com/drive/folders/1_DtjT9-e9uPvVyR1jOYcpGyVmNxNc3wQ?usp=sharing)

## Table of Contents

- [Try it Out!](#try-it-out)
- [Setup Instructions](#setup-instructions)
- [Crucial Dependencies](#crucial-dependencies)
- [Implemented Features](#implemented-features)

## Setup Instructions

Ready to dive into the code and get this project running on your local machine? Here's how you can set it up:

### Prerequisites

Before you embark on this journey, make sure you have these essentials installed:

-   **Node.js**: The heart of our JavaScript environment. Grab the [LTS version](https://nodejs.org/en/download/) for stability.
-   **npm** or **Yarn**: Your trusty package managers. npm comes bundled with Node.js, or you can [install Yarn globally](https://classic.yarnpkg.com/en/docs/install/) if that's your preference.
-   **Expo CLI**: Our magical tool for developing universal React Native apps. Install it globally:
    ```bash
    npm install -g expo-cli
    # OR
    yarn global add expo-cli
    ```

### Installation

Let's get the project files onto your machine and ready to go:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd "Facility Booking App/booking-app"
    ```
    (Remember to replace `<repository-url>` with the actual URL of this Git repository.)

2.  **Install dependencies:**
    Once inside the project directory, fetch all the necessary packages:
    ```bash
    npm install
    # OR
    yarn install
    ```

### Running the Application

With everything installed, you're just a few commands away from seeing the app come to life:

-   **Start the development server:**
    This command kicks off the Expo development server, opening a new tab in your browser with Expo Dev Tools, your control center for the app.
    ```bash
    npm start
    # OR
    yarn start
    ```

-   **Run on Android emulator/device:**
    ```bash
    npm run android
    # OR
    yarn android
    ```

-   **Run on iOS simulator/device:**
    ```bash
    npm run ios
    # OR
    yarn ios
    ```

-   **Run on Web browser:**
    ```bash
    npm run web
    # OR
    yarn web
    ```

## Crucial Dependencies

Behind the scenes, this app is powered by a selection of fantastic libraries, each playing a vital role in making it robust, efficient, and a joy to develop. Here's a peek at our core toolkit and why we chose them:

-   **[Expo Router](https://docs.expo.dev/router/introduction/)**
    -   **What it does**: Think of Expo Router as the app's intelligent GPS. It uses your file structure to automatically create navigation paths, making routing incredibly intuitive and easy to manage.
    -   **Why choose it**: Its seamless integration with Expo means less configuration and more coding. Plus, it helps us build a truly universal app that feels at home on web, iOS, and Android, all from a single codebase.

-   **[@tanstack/react-query](https://tanstack.com/query/latest)**
    -   **What it does**: This is our secret weapon for handling all things data. React Query takes care of fetching, caching, synchronizing, and updating server data in your React components, making your app feel incredibly snappy and responsive.
    -   **Why choose it**: It drastically cuts down on the boilerplate code usually associated with data fetching. It ensures our UI always reflects the latest data from the server, providing a smooth and consistent user experience.

-   **[expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)**
    -   **What it does**: When it comes to sensitive information like user tokens, security is paramount. Expo SecureStore provides a safe vault on the device to store small, encrypted strings of data, keeping them away from prying eyes.
    -   **Why choose it**: It's our go-to for safeguarding user credentials. By securely storing JWTs and refresh tokens, we ensure that user authentication is robust and protected against common vulnerabilities.

-   **[React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)**
    -   **What they do**:
        -   **React Hook Form**: This library makes building forms a delightful experience. It's performant, flexible, and simplifies everything from input handling to validation.
        -   **Zod**: Our trusty sidekick for data validation. Zod allows us to define clear, type-safe schemas for our data, ensuring that what goes into our forms (and eventually our backend) is exactly what we expect.
    -   **Why we love them**: This dynamic duo provides an unbeatable combination for forms. React Hook Form gives us incredible control and performance, while Zod ensures our data is always valid and type-safe, preventing unexpected bugs and improving overall data integrity.

-   **[Zustand](https://zustand-demo.pmnd.rs/)**
    -   **What it does**: Zustand is our minimalist approach to global state management. It's a small, fast, and incredibly easy-to-use library for sharing data across your entire application.
    -   **Why choose it**: Its simplicity is its superpower. With minimal boilerplate, we can manage crucial application-wide states, like a user's authentication status, efficiently and without unnecessary complexity.

-   **[Axios](https://axios-http.com/)**
    -   **What it does**: Axios is our reliable workhorse for making all network requests. It's a popular, promise-based HTTP client that handles communication with our backend API.
    -   **Why choose it**: Beyond just making requests, Axios shines with its powerful interceptors. These allow us to automatically attach authentication tokens to every outgoing request and, crucially, to gracefully handle the refreshing of expired access tokens behind the scenes, ensuring a continuous and secure user session.

## Implemented Features

This application is packed with features designed to provide a smooth and secure facility booking experience:

-   **User Authentication**:
    -   **Seamless Login**: Users can easily sign in to access their personalized features.
    -   **Effortless Registration**: New users can quickly create an account and join our community.
-   **Secure & Persistent Sessions**:
    -   Your access is protected! We securely store JWT (JSON Web Token) access and refresh tokens using `expo-secure-store`.
    -   No more annoying re-logins! Our smart system automatically refreshes your access token when it expires, thanks to a clever Axios interceptor that works silently in the background, keeping your session alive and secure.
-   **Intuitive Navigation**:
    -   Finding your way around the app is a breeze, thanks to the clear and efficient navigation structure powered by Expo Router.
-   **Fast Data Handling**:
    -   We use React Query to optimize how we fetch and manage data. This means faster loading times, smarter caching, and an overall more responsive app that keeps up with you.
-   **Smart & Reliable Forms**:
    -   Say goodbye to frustrating form errors! Our forms are built with React Hook Form for a smooth input experience, and validated rigorously using Zod schemas to ensure your data is always correct and secure.
-   **Centralized State Management**:
    -   Key application data, like your authentication status, is managed efficiently using Zustand. This ensures a consistent experience across all parts of the app.
-   **Explore Facilities**:
    -   Browse through a comprehensive list of available facilities.
    -   Dive into detailed views for each facility to learn more before booking.
-   **Manage Your Bookings**:
    -   Keep track of all your reservations in one place. View, modify, or cancel your bookings with ease.
-   **Personal Profile Management**:
    -   Your profile, your rules! Easily view and update your personal information within the app.
