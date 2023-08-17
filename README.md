# Cinememo App

The Cinememo App is a user-friendly and feature-rich application that allows users to keep track of their watched, watching, and upcoming movies, TV shows, animes, and more. With the ability to take notes and organize your entertainment preferences, Cinememo becomes your personal hub for managing your media consumption.

![Cinememo App](app-screenshot.png)

## Features

- **Easy Media Tracking:** Keep a comprehensive record of movies, TV shows, animes, and other media that you have watched or are currently watching.

- **Notes and Comments:** Take notes and write comments about each media entry, capturing your thoughts, ratings, and favorite moments.

- **Custom Lists:** Create custom lists to categorize and organize your media, such as "Favorite Movies," "Must-Watch TV Shows," or "Anime Recommendations."

- **Search and Discover:** Utilize the powerful search feature to quickly find specific titles or explore new options to watch.

- **Release Reminders:** Receive notifications for upcoming releases of your favorite media, ensuring you never miss out on new episodes or movies.

- **User Profile:** Personalize your profile with avatars and cover images. Share your watchlist and recommendations with friends.

- **Cross-Platform Access:** Access your watchlist and notes from any device with our seamless cross-platform synchronization.

## Installation

1. Clone the repository: `git clone https://github.com/homocodian/cinememo.git`
2. Navigate to the project directory: `cd Cinememo`
3. Get your google service json file from firebase console: `https://console.firebase.google.com`
<!-- FOR REMOTE BUILD THROUGH EXPO -->
4. Install eas cli: `yarn add eas-cli -g`
5. login to your expo account: `eas login`
6. Make your dev build: `yarn eas --platform all --profile development`

<!-- INSTALL DEPS -->
7. Install dependencies: `yarn install`

<!-- OR BUILD LOCALLY (MAKE SURE YOU HAVE ANDROID STUDIO/XCODE INSTALLED FOR RESPECTIVE PLATFORMS)-->

9. Make local build android/ios: `yarn android`

<!-- IN ANOTHER TERMINAL IF YOUR HAVE OPTTED FOR LOCAL BUILD -->

8. Start the application: `yarn start --dev-client`

## Usage

1. Launch the Cinememo App.
2. Sign up for an account or log in if you already have one.
3. Start adding media entries by searching for the title in the search bar.
4. Select the media from the search results and indicate whether you are "watching," "watched," or it's "upcoming."
5. Add notes, comments, and ratings to each media entry to keep track of your thoughts.
6. Create custom lists to better organize your media library.
7. Receive release reminders and notifications for your upcoming media.
8. Explore and discover new titles to add to your watchlist.

## Screenshots

![Media Search](screenshots/media-search.png)
_Easily search and add movies, TV shows, animes, and more._

![Watchlist](screenshots/watchlist.png)
_View and manage your watchlist with notes and comments._

![Custom Lists](screenshots/custom-lists.png)
_Create custom lists for better organization._

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m "Add some feature"`
4. Push the changes to your fork: `git push origin feature-name`
5. Create a pull request detailing your changes.

## License

This project is licensed under the [MIT License](LICENSE).

---

Happy watching and organizing with Cinememo App! If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/homocodian/cinememo/issues). We appreciate your feedback!
