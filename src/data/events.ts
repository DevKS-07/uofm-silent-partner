export type EventSpeaker = {
  name: string;
  role: string;
  company: string;
};

export type AgendaItem = {
  time: string;
  title: string;
  speaker?: string;
};

export type AppEvent = {
  id: string;
  name: string;
  location: string;
  date: string;
  venue: string;
  attendeeCount: string;
  category: string;
  ticketPrice: string;
  description: string;
  speakers: EventSpeaker[];
  agenda: AgendaItem[];
  highlights: string[];
  tags: string[];
};

export const ALL_EVENTS: AppEvent[] = [
  {
    id: '1',
    name: 'TechCrunch Disrupt',
    location: 'San Francisco, CA',
    date: 'Oct 12–14',
    venue: 'Moscone Center West',
    attendeeCount: '12,000+',
    category: 'Startup & VC',
    ticketPrice: 'From $895',
    description:
      'TechCrunch Disrupt is the world\'s leading authority in debuting revolutionary startups, hosting landmark discussions and showcasing innovative technology. Three days of keynotes, panels, workshops, and the iconic Startup Battlefield competition where founders pitch for $100k.',
    speakers: [
      { name: 'Sam Altman', role: 'CEO', company: 'OpenAI' },
      { name: 'Garry Tan', role: 'President & CEO', company: 'Y Combinator' },
      { name: 'Aigerim Bekova', role: 'General Partner', company: 'Sequoia Capital' },
    ],
    agenda: [
      { time: '9:00 AM', title: 'Opening Keynote: The Next Wave of AI', speaker: 'Sam Altman' },
      { time: '11:30 AM', title: 'Startup Battlefield — Round 1' },
      { time: '2:00 PM', title: 'Panel: Fundraising in a Down Market', speaker: 'Garry Tan' },
      { time: '4:30 PM', title: 'Networking Happy Hour — Startup Alley' },
    ],
    highlights: [
      'Startup Battlefield competition with $100k prize',
      'Access to 500+ exhibiting startups',
      'Investor speed-dating sessions',
      'Exclusive after-parties and side events',
      'Live demo arena with product showcases',
    ],
    tags: ['Startups', 'VC', 'AI', 'Demo Day'],
  },
  {
    id: '2',
    name: 'Web Summit Lisbon',
    location: 'Lisbon, Portugal',
    date: 'Nov 4–7',
    venue: 'Altice Arena & FIL',
    attendeeCount: '70,000+',
    category: 'Global Tech',
    ticketPrice: 'From €695',
    description:
      'Web Summit is one of the largest and most influential technology conferences in the world. Bringing together founders, CEOs, investors, and policymakers, it\'s the definitive meeting point for the global tech community — spanning AI, climate tech, healthtech, fintech, and more.',
    speakers: [
      { name: 'Paddy Cosgrave', role: 'Founder & CEO', company: 'Web Summit' },
      { name: 'Reid Hoffman', role: 'Co-Founder', company: 'LinkedIn' },
      { name: 'Margrethe Vestager', role: 'EVP', company: 'European Commission' },
    ],
    agenda: [
      { time: '10:00 AM', title: 'Centre Stage Keynote: Tech & Democracy' },
      { time: '12:00 PM', title: 'Night Summit Pitch Competition — Startups' },
      { time: '2:30 PM', title: 'Workshop: Building in Regulated Markets', speaker: 'Margrethe Vestager' },
      { time: '5:00 PM', title: 'Investors Summit — Closed-Door Roundtables' },
    ],
    highlights: [
      '1,200+ speakers across 20+ tracks',
      'Dedicated investor summit with 2,000+ VCs',
      'Alpha & Beta startup programs',
      'Evening events across Lisbon city',
      'Media wall and global live stream',
    ],
    tags: ['Global', 'Policy', 'Climate Tech', 'Fintech'],
  },
  {
    id: '3',
    name: 'SXSW Interactive',
    location: 'Austin, TX',
    date: 'Mar 8–10',
    venue: 'Austin Convention Center',
    attendeeCount: '35,000+',
    category: 'Innovation & Culture',
    ticketPrice: 'From $1,450',
    description:
      'SXSW Interactive is where the future is born. A collision of technology, creativity, and culture — with sessions on emerging tech, design, gaming, music, and film. Known for launching cultural phenomena and tech movements, it\'s an unmissable gathering for innovators across every discipline.',
    speakers: [
      { name: 'Elan Lee', role: 'Co-Founder', company: 'Exploding Kittens' },
      { name: 'Rashida Jones', role: 'President', company: 'MSNBC' },
      { name: 'Caitlin Doughty', role: 'Author & Mortician', company: 'Order of the Good Death' },
    ],
    agenda: [
      { time: '9:30 AM', title: 'Opening Session: Creativity in the Age of AI' },
      { time: '11:00 AM', title: 'Interactive Tech Expo — Hall A' },
      { time: '1:30 PM', title: 'Gaming & Future of Entertainment Track' },
      { time: '6:00 PM', title: 'Official SXSW Music Showcase' },
    ],
    highlights: [
      'Cross-industry collision of tech, music, and film',
      '500+ sessions, workshops, and screenings',
      'Interactive Expo with 200+ exhibitors',
      'Legendary unofficial side events and parties',
      'Annual Dewey Award and accelerator showcase',
    ],
    tags: ['Innovation', 'Culture', 'Gaming', 'Design'],
  },
  {
    id: '4',
    name: 'Y Combinator Demo Day',
    location: 'Mountain View, CA',
    date: 'Apr 2–3',
    venue: 'Computer History Museum',
    attendeeCount: '2,500+',
    category: 'Venture & Founders',
    ticketPrice: 'Invite Only',
    description:
      'Y Combinator Demo Day is the most prestigious founder event in Silicon Valley. Twice a year, the latest YC batch presents two-minute pitches to a curated audience of top investors, operators, and press. The startups you see here will define the next generation of tech companies.',
    speakers: [
      { name: 'Garry Tan', role: 'President & CEO', company: 'Y Combinator' },
      { name: 'Jared Friedman', role: 'Partner', company: 'Y Combinator' },
      { name: 'Diana Hu', role: 'Partner', company: 'Y Combinator' },
    ],
    agenda: [
      { time: '8:30 AM', title: 'Check-In & Investor Networking Breakfast' },
      { time: '9:30 AM', title: 'Batch Intro & YC Mission Statement', speaker: 'Garry Tan' },
      { time: '10:00 AM', title: 'Company Pitches — Session 1 (60 startups)' },
      { time: '2:00 PM', title: 'Company Pitches — Session 2 + Q&A' },
    ],
    highlights: [
      '100–200 new startups pitching live',
      'Direct access to YC partners for Q&A',
      'Curated investor-only networking sessions',
      'Product demos in the exhibition hall',
      'Historically launches billion-dollar companies',
    ],
    tags: ['YC', 'Investors', 'Pitching', 'Early Stage'],
  },
  {
    id: '5',
    name: 'AWS re:Invent',
    location: 'Las Vegas, NV',
    date: 'Dec 1–5',
    venue: 'Multiple Venues — The Strip',
    attendeeCount: '55,000+',
    category: 'Cloud & Infrastructure',
    ticketPrice: 'From $1,799',
    description:
      'AWS re:Invent is the premier cloud computing conference. Over five days across multiple venues on the Las Vegas Strip, Amazon Web Services reveals its roadmap, launches new services, and hosts 2,000+ technical sessions for engineers, architects, and CTOs building on the cloud.',
    speakers: [
      { name: 'Matt Garman', role: 'CEO', company: 'Amazon Web Services' },
      { name: 'Werner Vogels', role: 'CTO', company: 'Amazon' },
      { name: 'Swami Sivasubramanian', role: 'VP of AI & Data', company: 'AWS' },
    ],
    agenda: [
      { time: '8:00 AM', title: 'Keynote: AWS State of the Cloud', speaker: 'Matt Garman' },
      { time: '11:00 AM', title: 'Deep-Dive: Generative AI on AWS', speaker: 'Swami Sivasubramanian' },
      { time: '2:00 PM', title: 'Builders Sessions — Hands-On Labs' },
      { time: '4:00 PM', title: 'The Venetian Expo & Partner Ecosystem' },
    ],
    highlights: [
      '2,000+ technical sessions across all skill levels',
      'Hands-on builder labs and workshops',
      'Certification exams on-site',
      'AWS partner and marketplace expo',
      'Major service launches and roadmap reveals',
    ],
    tags: ['Cloud', 'DevOps', 'AI/ML', 'Infrastructure'],
  },
  {
    id: '6',
    name: 'ProductHunt Global',
    location: 'Online',
    date: 'Jan 15',
    venue: 'Virtual — Global',
    attendeeCount: '80,000+',
    category: 'Product & Design',
    ticketPrice: 'Free',
    description:
      'ProductHunt Global is the world\'s largest product launch event, where makers, founders, and early adopters converge to celebrate new products. In one day, thousands of products are voted on by the community — making it the launchpad of choice for indie hackers, startups, and consumer apps.',
    speakers: [
      { name: 'Ryan Hoover', role: 'Founder', company: 'Product Hunt' },
      { name: 'Lenny Rachitsky', role: 'Writer & Host', company: 'Lenny\'s Newsletter' },
      { name: 'Shreyas Doshi', role: 'Former PM Lead', company: 'Stripe & Twitter' },
    ],
    agenda: [
      { time: '12:00 AM PST', title: 'Submission Deadline — Products Go Live' },
      { time: '9:00 AM', title: 'Live AMA: How to Build Viral Products', speaker: 'Ryan Hoover' },
      { time: '12:00 PM', title: 'PM Deep Dive & Fireside Chat', speaker: 'Lenny Rachitsky' },
      { time: '9:00 PM', title: 'Voting Closes — Winners Announced' },
    ],
    highlights: [
      'Global community of 2M+ makers and early adopters',
      'Top products featured on the homepage for 24h',
      'Live AMAs with renowned product leaders',
      'Maker community Slack and Discord access',
      'Media coverage from top tech publications',
    ],
    tags: ['Product', 'SaaS', 'Indie Hackers', 'Launch'],
  },
  {
    id: '7',
    name: 'CES 2025',
    location: 'Las Vegas, NV',
    date: 'Jan 7–10',
    venue: 'Las Vegas Convention Center',
    attendeeCount: '130,000+',
    category: 'Consumer Electronics',
    ticketPrice: 'From $300',
    description:
      'CES is the most influential tech event in the world — the global stage where next-generation innovations are introduced to the marketplace. From AI and robotics to health tech and sustainability, CES 2025 showcases the breadth of what technology can do and where it\'s headed.',
    speakers: [
      { name: 'Jensen Huang', role: 'CEO', company: 'NVIDIA' },
      { name: 'Mary Barra', role: 'CEO', company: 'General Motors' },
      { name: 'Dr. Lisa Su', role: 'CEO', company: 'AMD' },
    ],
    agenda: [
      { time: '9:00 AM', title: 'CES Keynote: AI Everywhere', speaker: 'Jensen Huang' },
      { time: '11:30 AM', title: 'Sustainability & CleanTech Summit' },
      { time: '2:00 PM', title: 'Automotive & Mobility Innovation Showcase', speaker: 'Mary Barra' },
      { time: '5:00 PM', title: 'Innovation Awards Ceremony' },
    ],
    highlights: [
      '4,500+ exhibiting companies from 160+ countries',
      'C-Space executive program for senior leaders',
      'Innovation Awards across 29 product categories',
      'Eureka Park startup pavilion — 1,000+ startups',
      'Live product reveals from Samsung, Sony, LG and more',
    ],
    tags: ['Hardware', 'Robotics', 'Mobility', 'Health Tech'],
  },
  {
    id: '8',
    name: 'Founders Summit',
    location: 'New York, NY',
    date: 'Sep 20–21',
    venue: 'Spring Studios, Tribeca',
    attendeeCount: '1,500+',
    category: 'Founders & Operators',
    ticketPrice: 'From $2,500',
    description:
      'Founders Summit is an intimate, invite-only gathering of operators, founders, and investors who have built and scaled real businesses. No fluff — just brutally honest conversations about what it takes to build, hire, fundraise, and survive as a founder in today\'s market.',
    speakers: [
      { name: 'David Sacks', role: 'General Partner', company: 'Craft Ventures' },
      { name: 'Elad Gil', role: 'Investor & Author', company: 'High Growth Handbook' },
      { name: 'Claire Hughes Johnson', role: 'Advisor', company: 'Stripe (former COO)' },
    ],
    agenda: [
      { time: '9:00 AM', title: 'Welcome & Community Intros — Tribeca Rooftop' },
      { time: '10:00 AM', title: 'Fireside: Scaling from 10 to 100', speaker: 'Claire Hughes Johnson' },
      { time: '1:30 PM', title: 'Roundtables: GTM, Hiring, Fundraising' },
      { time: '3:30 PM', title: 'Panel: Navigating the 2025 Macro Environment', speaker: 'David Sacks' },
    ],
    highlights: [
      'Strictly curated attendee list — no tourists',
      'Off-the-record roundtables with 20-person max',
      'Operator-led workshops on growth, product, and ops',
      'Private dinners and curated 1:1 introductions',
      'Annual Founders100 recognition list',
    ],
    tags: ['Founders', 'Operators', 'Growth', 'Fundraising'],
  },
];
