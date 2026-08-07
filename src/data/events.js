// mock events -- upgraded with full details to match Figma and DB schema
const initialEvents = [
  {
    id: 1,
    title: "Jazz in the Park",
    category: "Music",
    emoji: "🎷",
    date: "Sun, Aug 15",
    time: "6:00 PM",
    venue: "Marcus Garvey Park",
    address: "18 Mt Morris Park W, New York, NY",
    price: "Free",
    description: "Join us for a relaxing evening of live jazz in the amphitheater. Bring a blanket, some snacks, and enjoy performances by local trios and quartets under the stars.",
    tags: ["Music", "Outdoors", "Community", "Live"],
    attendeeCount: 42,
    attendeeGoal: 100,
    organizer: "Harlem Arts Council",
    saved: false
  },
  {
    id: 2,
    title: "Farmers & Makers Market",
    category: "Market",
    emoji: "🛍",
    date: "Sun, Aug 10",
    time: "9:00 AM",
    venue: "Dolores Park",
    address: "Dolores St & 18th St, San Francisco, CA",
    price: "Free",
    description: "Weekly open-air market featuring 60+ local vendors. Farm-fresh produce, handcrafted goods, artisan food, and live acoustic music throughout the day.",
    tags: ["Market", "Local", "Organic", "Artisan"],
    attendeeCount: 312,
    attendeeGoal: 400,
    organizer: "Green Roots Collective",
    saved: true
  },
  {
    id: 3,
    title: "Knicks Watch Party",
    category: "Sports",
    emoji: "🏀",
    date: "Fri, Aug 18",
    time: "7:30 PM",
    venue: "Harlem Tavern",
    address: "2153 Frederick Douglass Blvd, New York, NY",
    price: "$10 Credits",
    description: "Come watch the Knicks game on the big screens! Food and drink specials all night. RSVP guarantees entry and one free appetizer for the table.",
    tags: ["Sports", "Watch Party", "Drinks", "Indoor"],
    attendeeCount: 65,
    attendeeGoal: 80,
    organizer: "NYC Sports Fans",
    saved: false
  },
  {
    id: 4,
    title: "Street Art Walk",
    category: "Art",
    emoji: "🎨",
    date: "Tue, Aug 20",
    time: "2:00 PM",
    venue: "Graffiti Hall of Fame",
    address: "106th St & Park Ave, New York, NY",
    price: "Free",
    description: "A guided walking tour exploring the vibrant street art and murals of East Harlem. Learn about the artists and the history of the neighborhood. Wear comfortable shoes!",
    tags: ["Art", "Walking", "Culture", "Educational"],
    attendeeCount: 18,
    attendeeGoal: 30,
    organizer: "NYC Street Art Tours",
    saved: true
  }
];

export { initialEvents };