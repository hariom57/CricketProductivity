# RunRate 🏏

A beautiful, gamified Data Structures and Algorithms (DSA) tracker that brings the thrill of a cricket run chase to your coding journey! 

Whether you're preparing for big tech interviews (Google, Amazon, Microsoft) or just maintaining a daily coding habit, **RunRate** visualizes your progress using intuitive cricket metrics and striking visual activity maps.

![RunRate Dashboard](https://via.placeholder.com/800x400?text=RunRate+Dashboard) *(Replace with actual screenshot)*

## 🌟 Features

- **Cricket Scoreboard Metrics**: Track your progress dynamically with "Runs" (Questions Solved), **Current Run Rate (CRR)**, and **Required Run Rate (RRR)**. Are you ahead of the required rate, or do you need to accelerate your solving speed?
- **Consistency Map**: A dynamic, GitHub-style contribution calendar heatmap showing your daily activity strictly across the duration of your goal.
- **Instant Innings Logging**: Quickly log your daily solved questions via a sleek, centered popup modal.
- **Fully Responsive Architecture**: Meticulously designed to fit 100% of your screen height with **zero vertical scrolling needed**, whether you're using an ultra-wide desktop monitor, a tablet, or a mobile phone.
- **Premium Dark Aesthetics**: Built with glassmorphism panels, deep blacks, and vibrant neon-green brand accents suitable for long coding nights.

## 💻 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router format) 
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components/Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: `react-calendar-heatmap`
- **Date Utility**: `date-fns`

### Backend
- **Environment**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **API**: RESTful endpoints for Goal Management and Progress Tracking
- **Other**: CORS, dotenv

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (e.g., MongoDB Atlas)

### Setup Instructions

1. **Clone the repository:**
   \`\`\`bash
   git clone git@github.com:hariom57/CricketProductivity.git
   cd CricketProductivity
   \`\`\`

2. **Backend Setup:**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`
   - Create a \`.env\` file in the `backend` directory.
   - Add your variables:
     \`\`\`env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     \`\`\`
   - Start the backend server:
     \`\`\`bash
     npm run dev
     \`\`\`

3. **Frontend Setup:**
   \`\`\`bash
   cd ../frontend
   npm install
   \`\`\`
   - Start the frontend development server:
     \`\`\`bash
     npm run dev
     \`\`\`

4. **Play!**
   - Open your browser and navigate to `http://localhost:3000`. Set your Target Runs (Questions) and Total Overs (Days), and start your chase!

## 🛣️ Roadmap / Future Enhancements
- [ ] Native mobile widget support.
- [ ] LeetCode / Codeforces auto-sync integration.
- [ ] Advanced trend graphs and topic-wise difficulty tracking.

---
*Built with passion to crack big tech.*
