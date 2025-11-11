# Git Text Editor - Android Application

A fully functional Android text editor application with integrated GitHub support for file management and uploading.

## Features

### Text Editing Capabilities
- Create, open, and edit text files (.txt, .md, .java, .json, .xml, .py, etc.)
- Syntax highlighting support for common programming languages (Java, Kotlin, Python, JSON, XML, Markdown)
- Undo/Redo functionality
- Find and Replace feature
- Line numbering
- Theme support (Light/Dark modes)
- Auto-save functionality
- Adjustable font size

### File Management
- Browse and manage local files on device
- Create new files and folders
- Delete, rename, duplicate files
- Recent files quick access
- File categories/organization

### GitHub Integration
- GitHub authentication via Personal Access Token
- Browse GitHub repositories
- View repository contents and navigate directories
- View file contents from GitHub
- Edit files directly in the app
- Commit changes with messages
- Push commits to GitHub
- View commit history
- Create and manage branches

### User Interface
- Clean, intuitive Material Design 3 interface
- Tab navigation for Files and Recent sections
- File tree/explorer view
- Editor with toolbar for formatting
- GitHub account info display
- Settings screen for configuration

## Technical Stack

- **Language:** Kotlin
- **Minimum SDK:** 24 (Android 7.0)
- **Target SDK:** 34
- **Architecture:** MVVM with Repository pattern
- **Libraries:**
  - GitHub API: OkHttp + Retrofit
  - File management: Standard Android File APIs
  - UI: Material Components for Android
  - Database: Room (for cache/recent files)
  - DataStore: Preferences storage
  - Coroutines: Asynchronous operations

## Setup Instructions

1. Clone the repository
2. Open the project in Android Studio
3. Sync Gradle files
4. Run the application on an emulator or physical device

## GitHub Integration Setup

To use GitHub features:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with the following permissions:
   - `repo` (Full control of private repositories)
   - `user` (Read user profile data)
3. In the app, tap on GitHub icon and enter your token
4. You can now browse repositories, view/edit files, and commit changes

## Permissions

The app requires the following permissions:
- Internet access (for GitHub API)
- Network state (to check connectivity)
- Storage access (for reading/writing local files)

## Project Structure

```
app/
├── src/main/
│   ├── java/com/texteditor/
│   │   ├── data/
│   │   │   ├── api/          # GitHub API services
│   │   │   ├── database/     # Room database
│   │   │   ├── models/       # Data models
│   │   │   └── repository/   # Repository pattern implementations
│   │   ├── ui/
│   │   │   ├── editor/       # Text editor activity and ViewModel
│   │   │   ├── files/        # File browser and ViewModel
│   │   │   ├── github/       # GitHub integration activities
│   │   │   └── settings/     # Settings activity
│   │   └── utils/            # Utility classes
│   └── res/
│       ├── layout/           # XML layouts
│       ├── menu/             # Menu resources
│       └── values/           # Strings, colors, themes
```

## Features Highlights

### Syntax Highlighting
Supports syntax highlighting for:
- Java
- Kotlin
- Python
- JSON
- XML
- Markdown

### Auto-Save
The editor automatically saves your work every 3 seconds to prevent data loss.

### Theme Support
Choose between:
- Light mode
- Dark mode
- System default (follows device theme)

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
