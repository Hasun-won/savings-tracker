# Savings Tracker

A simple web app for tracking income, expenses, and savings goals. Built with vanilla JavaScript and hosted on GitHub Pages.

## Features

- **Dashboard**: Overview of monthly cash flow, active savings accounts, and transaction log
- **Registration**: Calendar-based interface for adding daily transactions
- **Persistence**: All data stored locally in the browser using localStorage
- **Charts**: Visual representation of savings progress using Chart.js

## Project Structure

```
savings-tracker/
├── index.html          # Dashboard page
├── register.html       # Transaction registration page
├── css/
│   └── styles.css      # Shared styles
├── js/
│   ├── app.js          # Shared utilities and localStorage functions
│   ├── dashboard.js    # Dashboard page logic
│   └── register.js     # Registration page logic
└── lib/
    └── chart.umd.js    # Chart.js library
```

## Architecture

### Data Model
- **Accounts**: Savings plans with frequency (daily/monthly), amounts, and targets
- **Transactions**: Individual income/expense entries with date, description, amount, and type

### Storage
- Uses browser localStorage for persistence
- Data survives browser sessions but is local to the device

### Pages
1. **Dashboard (index.html)**: 
   - Monthly overview with charts
   - Account progress tracking
   - Transaction history

2. **Registration (register.html)**:
   - Monthly calendar view
   - Click days to add transactions
   - Modal form for transaction entry

### Key Components
- **Chart.js**: For bar/line charts on dashboard
- **Calendar Grid**: Custom-built calendar component
- **Modal System**: For transaction forms
- **Tab Navigation**: Within dashboard

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a web browser
3. Start tracking your finances!

## Deployment

This app is designed to be hosted on GitHub Pages. Simply upload all files to your repository and enable Pages in the repository settings.

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage
- Canvas API (for charts)

## Customization

- Modify `DEFAULT_ACCOUNTS` in `js/app.js` to set up your savings goals
- Adjust `SALARY` constant for your income
- Customize colors and styles in `css/styles.css`