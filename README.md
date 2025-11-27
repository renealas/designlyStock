# DesignlyStock - Stock Market Tracking App

DesignlyStock is a comprehensive mobile application built with React Native and Expo that allows users to track stock prices, set price alerts, and visualize stock data. The app provides real-time stock updates through WebSocket connections and features a clean, intuitive user interface.

![DesignlyStock Logo](./assets/logo/designly.png)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Authentication](#authentication)
- [Screens and Functionality](#screens-and-functionality)
  - [Watchlist Screen](#watchlist-screen)
  - [Alert Screen](#alert-screen)
  - [Graph Screen](#graph-screen)
- [API Integration](#api-integration)
- [WebSocket Implementation](#websocket-implementation)
- [Notifications](#notifications)
- [Styling and Theming](#styling-and-theming)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure login using Auth0 integration
- **Real-time Stock Updates**: Live stock price updates via WebSocket connection
- **Watchlist Management**: Track your favorite stocks in a customizable watchlist
- **Price Alerts**: Set price alerts for stocks and receive notifications
- **Data Visualization**: View stock price data in interactive charts
- **Responsive UI**: Clean and intuitive user interface with light/dark mode support
- **Offline Fallback**: Mock data generation when API is unavailable or rate-limited

## Project Structure

The project follows a modular structure with the following key directories:

```
DesignlyStock/
├── app/                  # Main application code using Expo Router
│   ├── (tabs)/           # Tab-based navigation screens
│   ├── _layout.tsx       # Root layout configuration
│   ├── login.tsx         # Login screen
│   └── modal.tsx         # Modal screen
├── assets/               # Static assets (images, logos, etc.)
├── components/           # Reusable UI components
│   ├── ui/               # Basic UI components
│   └── ...               # Feature-specific components
├── constants/            # Application constants
├── contexts/             # React contexts (Auth, etc.)
├── hooks/                # Custom React hooks
├── services/             # API and service integrations
├── types/                # TypeScript type definitions
└── scripts/              # Utility scripts
```

## Technologies Used

- **React Native**: Core framework for building the mobile application
- **Expo**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript for better development experience
- **Expo Router**: File-based routing system
- **Auth0**: Authentication and user management
- **Finnhub API**: Stock market data provider
- **WebSockets**: Real-time data communication
- **React Native Chart Kit**: Data visualization
- **Expo Notifications**: Push notifications for price alerts
- **Expo Secure Store**: Secure storage for authentication tokens
- **RxJS**: Reactive programming library for handling asynchronous data streams

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS testing) or Android Emulator (for Android testing)
- Expo Go app on a physical device (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/designlyStock.git
   cd designlyStock
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (if needed):
   - The app uses Auth0 for authentication. The credentials are already set up in the constants/auth0.ts file.
   - The Finnhub API key is included in the services/finnhubApi.ts file.

### Running the App

1. Start the development server:

   ```bash
   npx expo start
   ```

2. Run on a simulator/emulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

3. Run on a physical device:
   - Scan the QR code with the Expo Go app (Android) or the Camera app (iOS)

## Authentication

The app uses Auth0 for authentication. The authentication flow is managed by the `AuthContext` in `contexts/AuthContext.tsx`. Key features include:

- Secure token storage using Expo Secure Store
- Automatic token refresh
- Login and logout functionality
- User profile information retrieval

The logout button is available on each screen in the top-right corner of the header.

## Screens and Functionality

### Watchlist Screen

The Watchlist screen (`app/(tabs)/watchlist.tsx`) displays a list of stocks with their current prices and price changes. Features include:

- Real-time price updates
- Toggle between live and static data modes
- Pull-to-refresh functionality to update stock data
- WebSocket connection status indicator
- Automatic fallback to mock data when API is rate-limited

### Alert Screen

The Alert screen (`app/(tabs)/alert.tsx`) allows users to set price alerts for stocks. Features include:

- Select stocks from the watchlist
- Set target prices for alerts
- View and manage existing alerts
- Delete alerts
- Test notification functionality

### Graph Screen

The Graph screen (`app/(tabs)/graph.tsx`) provides visual representation of stock data. Features include:

- Line chart showing stock prices
- Portfolio statistics (highest, lowest, average values)
- Pull-to-refresh functionality to update data

## API Integration

The app integrates with the Finnhub API to fetch stock market data. The API integration is handled in the `services/finnhubApi.ts` file. Key endpoints used:

- `/stock/symbol`: Fetch available stock symbols
- `/quote`: Get current stock quotes
- `/stock/profile2`: Get company profiles

The API key is included in the code for demonstration purposes. In a production environment, it should be stored securely.

## WebSocket Implementation

Real-time stock updates are implemented using WebSockets. The WebSocket service is defined in `services/finnhubWebSocket.ts`. Features include:

- Automatic connection management
- Subscription to specific stock symbols
- Reconnection logic with exponential backoff
- Fallback to mock data generation when API is rate-limited
- RxJS Observables for reactive data handling

## Notifications

The app uses Expo Notifications to send price alerts to users. The notification service is defined in `services/notificationService.ts`. Features include:

- Permission handling
- Custom notification channels for Android
- Price alert triggers based on real-time stock prices
- Rich notification content

## Styling and Theming

The app uses a consistent styling approach with:

- Themed components that adapt to light/dark mode
- Style sheets defined in separate files (e.g., `alert.styles.ts`)
- Common color palette defined in `constants/theme.ts`
- Responsive layouts that adapt to different screen sizes

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**:
   - The app will automatically attempt to reconnect
   - After 5 failed attempts, it will switch to mock data mode

2. **Authentication Issues**:
   - Check your internet connection
   - Ensure Auth0 credentials are correct
   - Try clearing the app cache and restarting

3. **API Rate Limiting**:
   - The Finnhub API has rate limits for free accounts
   - The app will automatically switch to mock data when rate-limited

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
