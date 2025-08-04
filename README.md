# AI-FEED: Zero Hunger Initiative

AI-FEED is a web application designed to address UN SDG 2: Zero Hunger by connecting food donors with food banks and shelters using AI-powered matching and gamification.

## Features

- **AI-Powered Matching**: Automatically matches food donors with recipients based on multiple criteria
- **Smart Logistics**: Optimizes delivery routes and schedules
- **Gamification**: Rewards donors with points and badges
- **Real-time Updates**: Instant notifications for matches and pickups
- **User-friendly Interface**: Responsive design for both donors and recipients

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: IBM Cloudant
- **AI Services**: IBM Watson Assistant (optional)
- **Deployment**: IBM Cloud

## Prerequisites

1. Node.js (v14 or later)
2. IBM Cloud account
3. IBM Cloudant instance
4. (Optional) IBM Watson Assistant instance

## Setup Instructions

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd ai-feed
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure environment variables**
Create a \`.env\` file in the project root with the following variables:
\`\`\`
PORT=3000
NODE_ENV=development

# IBM Cloudant Credentials
CLOUDANT_API_KEY=your-cloudant-api-key
CLOUDANT_URL=your-cloudant-url
CLOUDANT_DB_NAME=ai-feed-db

# JWT Secret
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# IBM Watson Assistant Credentials (Optional)
WATSON_ASSISTANT_API_KEY=your-watson-assistant-api-key
WATSON_ASSISTANT_URL=your-watson-assistant-url
WATSON_ASSISTANT_ID=your-watson-assistant-id
\`\`\`

4. **Set up IBM Cloudant**
- Create a new IBM Cloudant instance in your IBM Cloud account
- Create a new database named 'ai-feed-db'
- Copy the API key and URL to your .env file

5. **Start the application**
\`\`\`bash
npm start
\`\`\`

The application will be available at \`http://localhost:3000\`

## IBM Cloud Deployment

1. **Install IBM Cloud CLI**
Download and install the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/reference/ibmcloud?topic=cloud-cli-getting-started)

2. **Login to IBM Cloud**
\`\`\`bash
ibmcloud login
\`\`\`

3. **Target the Cloud Foundry org/space**
\`\`\`bash
ibmcloud target --cf
\`\`\`

4. **Deploy the application**
\`\`\`bash
ibmcloud cf push
\`\`\`

## Project Structure

\`\`\`
ai-feed/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── models/
│   │   ├── User.js
│   │   ├── Donation.js
│   │   └── Match.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── matches.js
│   │   └── recipients.js
│   ├── services/
│   │   ├── GamificationService.js
│   │   └── MatchingService.js
│   └── server.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── donor-dashboard.js
│   │   └── recipient-dashboard.js
│   ├── index.html
│   ├── donor-dashboard.html
│   └── recipient-dashboard.html
├── package.json
└── .env
\`\`\`

## Testing

1. **Register as a donor**
- Visit the homepage and click "Register"
- Fill in the registration form, selecting "Food Donor" as the account type

2. **Register as a recipient**
- Register another account, selecting "Food Bank/Shelter" as the account type

3. **Test donation flow**
- Login as a donor
- Submit a new donation
- Check the matching result

4. **Test recipient flow**
- Login as a recipient
- Update facility profile and preferences
- Check available donations and matches

## Development Timeline

### Day 1: Front-end Development
- Set up project structure
- Create responsive UI with Bootstrap
- Implement user authentication forms
- Design donor and recipient dashboards

### Day 2: Back-end Setup
- Configure Node.js/Express server
- Set up IBM Cloudant database
- Implement authentication system
- Create basic API endpoints

### Day 3: AI and Gamification Integration
- Implement matching algorithm
- Add gamification features
- Integrate IBM Watson services (optional)
- Test and deploy to IBM Cloud

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
