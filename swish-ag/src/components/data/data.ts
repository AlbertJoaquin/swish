import coverage from "../assets/coverage.webp";
import score from "../assets/score.webp";
import stats from "../assets/stats.webp";
import nba from "../assets/nba.webp";
import espn from "../assets/espn.webp";
import swishAbout from "../assets/swish-about.webp";

export const dashButtons = [
  {
    id: "1",
    label: "Key Features",
    contents: [
      { 
        title: "Swish-AG Coverage", 
        description: "Provides complete game coverage including current game time, quarter status, and a full schedule of matches for yesterday, today, and tomorrow. It also includes relevant stats, giving you a full overview so you never miss any important updates or upcoming games.", 
        image: coverage.src,
        alt: "First image description"
      },
      {
        title: "Team Score", 
        description: "Displays real-time game scores so you can instantly see who's leading and how each match is progressing. Stay updated with live scoring changes, quarter-by-quarter results, and key moments without needing to refresh or switch pages.", 
        image: score.src,
        alt: "First image description"
      },
      { 
        title: "Player Stats", 
        description: "Shows detailed player and team statistics, including points, rebounds, assists, and other key performance metrics. This section helps you better understand team performance, compare players, and gain deeper insights into how the game is being played.", 
        image: stats.src,
        alt: "First image description"
      },
    ]
  },
  {
    id: "2",
    label: "Data Sources",
    contents: [
      { 
        title: "NBA", 
        description: "Data is sourced from National Basketball Association, the official league platform providing accurate and up-to-date game scores, schedules, and statistics. It ensures reliable information directly from the primary source of all NBA games.", 
        image: nba.src,
        alt: "First image description",
        link: "https://www.nba.com"
      },
      { 
        title: "ESPN", 
        description: "Additional data and coverage are powered by the Entertainment and Sports Programming Network, a leading sports media platform known for detailed game analysis, live updates, and comprehensive statistics, enhancing the overall experience with deeper insights.", 
        image: espn.src,
        alt: "First image description",
        link: "https://www.espn.com"
      },
    ]
  },
  {
    id: "3",
    label: "The Vision",
    contents: [
      { 
        title: "Behind Swish-AG", 
        description: "I built Swish-AG for my community and friends who love basketball. It enhances the usual NBA score experience by providing live scores, game schedules in Philippine Time (PHT), and the latest news from ESPN—all in one place, making the game easier and more enjoyable to follow.",
        image: swishAbout.src,
        alt: "First image description"
      }
    ]
  },
];