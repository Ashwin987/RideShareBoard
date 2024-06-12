RideShareBoard

Welcome to RideShareBoard, a real-time chat application designed for users to communicate and share rides efficiently. This project leverages Node.js, Express, MongoDB, and Google OAuth for authentication to create a seamless and secure user experience. Follow the instructions below to set up, run, and use the application.
Getting Started
Prerequisites

Before you begin, ensure you have the following installed on your machine:

    Node.js (v14.x or later)
    MongoDB (local or Atlas)
    Git

Installation

    Clone the repository:

    sh

git clone https://github.com/Ashwin987/RideShareBoard.git
cd RideShareBoard

Install the dependencies:

sh

npm install

Set up environment variables:
Create a .env file in the root directory and add the following variables:

sh

    MONGO_URI=mongodb://localhost:27017/chatApp
    SESSION_SECRET=your_session_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

Running the Application

    Start MongoDB:
    If you are using a local MongoDB instance, ensure it is running. For MongoDB Atlas, ensure your connection string in .env is correct.

    Start the server:

    sh

    node server.js

    Access the application:
    Open your web browser and go to http://localhost:8080.

Using the Website
Sign Up and Login

    Traditional Sign-Up/Login: Navigate to the Sign-Up page, create an account with a username and password, and log in using these credentials.
    Google Sign-In: Click the "Login with Google" button to authenticate using your Google account. The first time you log in with Google, you will be prompted to enter a nickname for use in the chatroom.

Chatroom

    Sending Messages: Once logged in, you can enter the chatroom. Type your message in the input box and click "Send" to post it to the chat.
    Searching Messages: Use the search bar to find specific messages by entering keywords. The chatroom will update to display messages matching your search criteria.
    Editing/Deleting Messages: You can edit or delete your own messages using the respective buttons next to each message.

Additional Features

    Real-time Updates: Messages sent in the chatroom are updated in real-time for all users, ensuring a smooth and dynamic communication experience.
    Security: User sessions are managed securely, and Google OAuth ensures that authentication is both robust and easy to use.
