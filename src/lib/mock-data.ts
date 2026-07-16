// Rich mock intelligence data for LID.
// Represents organizations, people, buildings, relationships.

export type OrgIndustry =
  | "Retail"
  | "Aviation"
  | "Hospitality"
  | "Banking"
  | "Real Estate"
  | "Luxury"
  | "Technology"
  | "Automotive"
  | "Government"
  | "Architecture"
  | "Media"
  | "Healthcare";

export type PipelineStage =
  | "Prospect"
  | "Qualified"
  | "Meeting"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export interface Organization {
  id: string;
  name: string;
  legalName?: string;
  industry: OrgIndustry;
  subIndustry: string;
  hq: string;
  country: string;
  countries: string[];
  employees: number;
  revenue: string; // e.g. "$4.2B"
  founded: number;
  website: string;
  description: string;
  logo: string; // initials fallback color
  tags: string[];
  parent?: string;
  scores: {
    lead: number;
    innovation: number;
    luxury: number;
    tech: number;
    priority: number;
  };
  clientStatus: "Prospect" | "Active Client" | "Past Client" | "Partner" | "Vendor";
  stage: PipelineStage;
  owner: string;
  locations: number;
  updatedAt: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  seniority: "C-Level" | "VP" | "Director" | "Manager" | "IC";
  decisionMaker: "Economic" | "Champion" | "Influencer" | "User" | "Blocker";
  orgId: string;
  email: string;
  phone?: string;
  linkedin: string;
  city: string;
  country: string;
  photoHue: number; // 0-360 for avatar gradient
  influence: number;
  relationship: number; // 0-100
  lastInteraction: string;
  tags: string[];
}

export interface Building {
  id: string;
  name: string;
  type: "Mall" | "Airport" | "Hotel" | "HQ" | "Museum" | "Stadium";
  city: string;
  country: string;
  ownerOrgId: string;
  openedYear: number;
  areaSqm: number;
}

export interface Relationship {
  id: string;
  from: string; // entity id (org or person)
  fromType: "org" | "person" | "building";
  to: string;
  toType: "org" | "person" | "building";
  type:
    | "works_at"
    | "owns"
    | "subsidiary_of"
    | "designed"
    | "partner"
    | "client_of"
    | "sponsors"
    | "manages"
    | "reports_to";
  strength: number; // 0-100
  since?: string;
}

export interface NewsItem {
  id: string;
  orgId: string;
  headline: string;
  source: string;
  date: string;
  category: "Expansion" | "Executive" | "Funding" | "Award" | "Launch";
}

export interface Opportunity {
  id: string;
  name: string;
  orgId: string;
  stage: PipelineStage;
  value: number; // USD
  probability: number;
  closeDate: string;
  owner: string;
}

export const organizations: Organization[] = [
  {
    id: "org_emaar",
    name: "Emaar Properties",
    legalName: "Emaar Properties PJSC",
    industry: "Real Estate",
    subIndustry: "Mixed-Use Developer",
    hq: "Dubai",
    country: "UAE",
    countries: ["UAE", "Saudi Arabia", "Egypt", "Turkey", "India"],
    employees: 4200,
    revenue: "$7.9B",
    founded: 1997,
    website: "emaar.com",
    description:
      "Master developer behind Burj Khalifa, Dubai Mall and Downtown Dubai. Anchor property platform in the region.",
    logo: "EM",
    tags: ["Flagship", "Luxury", "High Priority"],
    scores: { lead: 92, innovation: 78, luxury: 96, tech: 74, priority: 95 },
    clientStatus: "Active Client",
    stage: "Won",
    owner: "N. Al Mansouri",
    locations: 38,
    updatedAt: "2 h ago",
  },
  {
    id: "org_dxb",
    name: "Dubai Airports",
    industry: "Aviation",
    subIndustry: "Airport Authority",
    hq: "Dubai",
    country: "UAE",
    countries: ["UAE"],
    employees: 3100,
    revenue: "$2.4B",
    founded: 1960,
    website: "dubaiairports.ae",
    description:
      "Operator of DXB and DWC. Handles 92M+ annual passengers with major experiential retail programme.",
    logo: "DXB",
    tags: ["Airport", "Innovation", "Existing Client"],
    scores: { lead: 88, innovation: 91, luxury: 82, tech: 90, priority: 93 },
    clientStatus: "Active Client",
    stage: "Negotiation",
    owner: "R. Kaur",
    locations: 2,
    updatedAt: "yesterday",
  },
  {
    id: "org_lvmh",
    name: "LVMH",
    legalName: "LVMH Moët Hennessy Louis Vuitton SE",
    industry: "Luxury",
    subIndustry: "Conglomerate",
    hq: "Paris",
    country: "France",
    countries: ["France", "Italy", "USA", "Japan", "UAE", "China"],
    employees: 213000,
    revenue: "$86.2B",
    founded: 1987,
    website: "lvmh.com",
    description:
      "Parent to 75 maisons across fashion, jewellery, wines & spirits and selective retailing.",
    logo: "LV",
    tags: ["Luxury", "Global", "Priority"],
    scores: { lead: 84, innovation: 82, luxury: 100, tech: 76, priority: 91 },
    clientStatus: "Prospect",
    stage: "Proposal",
    owner: "N. Al Mansouri",
    locations: 6100,
    updatedAt: "3 d ago",
  },
  {
    id: "org_louis_vuitton",
    name: "Louis Vuitton",
    industry: "Luxury",
    subIndustry: "Fashion & Leather",
    hq: "Paris",
    country: "France",
    countries: ["France", "USA", "Japan", "China", "UAE"],
    employees: 38000,
    revenue: "$25.4B",
    founded: 1854,
    website: "louisvuitton.com",
    description:
      "Flagship maison of LVMH. Aggressive flagship & experiential retail rollout across MENA.",
    logo: "LV",
    parent: "org_lvmh",
    tags: ["Luxury", "Retail", "Flagship"],
    scores: { lead: 89, innovation: 85, luxury: 100, tech: 79, priority: 94 },
    clientStatus: "Prospect",
    stage: "Meeting",
    owner: "N. Al Mansouri",
    locations: 460,
    updatedAt: "6 h ago",
  },
  {
    id: "org_qia",
    name: "Qatar Investment Authority",
    industry: "Banking",
    subIndustry: "Sovereign Wealth",
    hq: "Doha",
    country: "Qatar",
    countries: ["Qatar", "UK", "USA", "France"],
    employees: 800,
    revenue: "$475B AUM",
    founded: 2005,
    website: "qia.qa",
    description:
      "Sovereign wealth fund with major stakes in luxury, real estate and hospitality globally.",
    logo: "QIA",
    tags: ["Sovereign", "Priority"],
    scores: { lead: 76, innovation: 65, luxury: 88, tech: 71, priority: 84 },
    clientStatus: "Prospect",
    stage: "Qualified",
    owner: "R. Kaur",
    locations: 4,
    updatedAt: "1 w ago",
  },
  {
    id: "org_neom",
    name: "NEOM",
    industry: "Real Estate",
    subIndustry: "Giga-project",
    hq: "Tabuk",
    country: "Saudi Arabia",
    countries: ["Saudi Arabia"],
    employees: 2400,
    revenue: "$500B budget",
    founded: 2017,
    website: "neom.com",
    description:
      "Saudi giga-project spanning The Line, Trojena, Sindalah and Oxagon. Deep innovation appetite.",
    logo: "NM",
    tags: ["Giga", "Innovation", "High Priority"],
    scores: { lead: 90, innovation: 100, luxury: 92, tech: 96, priority: 98 },
    clientStatus: "Prospect",
    stage: "Proposal",
    owner: "N. Al Mansouri",
    locations: 5,
    updatedAt: "12 h ago",
  },
  {
    id: "org_marriott",
    name: "Marriott International",
    industry: "Hospitality",
    subIndustry: "Hotel Group",
    hq: "Bethesda",
    country: "USA",
    countries: ["USA", "UAE", "UK", "France", "Japan"],
    employees: 411000,
    revenue: "$23.7B",
    founded: 1927,
    website: "marriott.com",
    description:
      "Largest hotel operator by rooms. Portfolio spans Ritz-Carlton, EDITION, W and St. Regis.",
    logo: "MR",
    tags: ["Hospitality", "Luxury"],
    scores: { lead: 71, innovation: 68, luxury: 84, tech: 73, priority: 78 },
    clientStatus: "Past Client",
    stage: "Prospect",
    owner: "L. Fischer",
    locations: 8500,
    updatedAt: "2 w ago",
  },
  {
    id: "org_apple",
    name: "Apple",
    industry: "Technology",
    subIndustry: "Consumer Electronics",
    hq: "Cupertino",
    country: "USA",
    countries: ["USA", "UAE", "China", "Japan", "UK", "France"],
    employees: 164000,
    revenue: "$383B",
    founded: 1976,
    website: "apple.com",
    description:
      "Retail experience benchmark. Global flagship rollout with heavy investment in in-store experience.",
    logo: "AP",
    tags: ["Tech", "Retail", "Flagship"],
    scores: { lead: 82, innovation: 100, luxury: 88, tech: 100, priority: 89 },
    clientStatus: "Prospect",
    stage: "Qualified",
    owner: "L. Fischer",
    locations: 520,
    updatedAt: "4 d ago",
  },
  {
    id: "org_meraas",
    name: "Meraas",
    industry: "Real Estate",
    subIndustry: "Developer",
    hq: "Dubai",
    country: "UAE",
    countries: ["UAE"],
    employees: 1600,
    revenue: "$3.1B",
    founded: 2007,
    website: "meraas.com",
    description:
      "Developer of City Walk, La Mer, Bluewaters and Ain Dubai. Strong experiential retail focus.",
    logo: "MR",
    tags: ["Developer", "Retail"],
    scores: { lead: 81, innovation: 84, luxury: 86, tech: 78, priority: 85 },
    clientStatus: "Active Client",
    stage: "Won",
    owner: "R. Kaur",
    locations: 14,
    updatedAt: "3 h ago",
  },
  {
    id: "org_hia",
    name: "Hamad International Airport",
    industry: "Aviation",
    subIndustry: "Airport",
    hq: "Doha",
    country: "Qatar",
    countries: ["Qatar"],
    employees: 6200,
    revenue: "$1.9B",
    founded: 2014,
    website: "dohahamadairport.com",
    description:
      "Award-winning airport with landmark art installations and high experiential retail spend.",
    logo: "HIA",
    tags: ["Airport", "Luxury", "Innovation"],
    scores: { lead: 79, innovation: 88, luxury: 90, tech: 85, priority: 86 },
    clientStatus: "Prospect",
    stage: "Meeting",
    owner: "R. Kaur",
    locations: 1,
    updatedAt: "1 d ago",
  },
  {
    id: "org_pif",
    name: "Public Investment Fund",
    industry: "Banking",
    subIndustry: "Sovereign Wealth",
    hq: "Riyadh",
    country: "Saudi Arabia",
    countries: ["Saudi Arabia", "USA", "UK"],
    employees: 2100,
    revenue: "$925B AUM",
    founded: 1971,
    website: "pif.gov.sa",
    description:
      "Anchor investor across NEOM, Diriyah, Red Sea Global and Roshn. Deep procurement pipeline.",
    logo: "PIF",
    tags: ["Sovereign", "Innovation", "High Priority"],
    scores: { lead: 88, innovation: 90, luxury: 82, tech: 87, priority: 94 },
    clientStatus: "Prospect",
    stage: "Qualified",
    owner: "N. Al Mansouri",
    locations: 6,
    updatedAt: "5 h ago",
  },
  {
    id: "org_foster",
    name: "Foster + Partners",
    industry: "Architecture",
    subIndustry: "Architecture Firm",
    hq: "London",
    country: "UK",
    countries: ["UK", "UAE", "USA", "China"],
    employees: 1800,
    revenue: "$310M",
    founded: 1967,
    website: "fosterandpartners.com",
    description:
      "Global architecture firm behind Apple Park, Bloomberg HQ, and multiple airport terminals.",
    logo: "F+",
    tags: ["Architecture", "Partner"],
    scores: { lead: 68, innovation: 84, luxury: 82, tech: 80, priority: 74 },
    clientStatus: "Partner",
    stage: "Won",
    owner: "L. Fischer",
    locations: 13,
    updatedAt: "1 w ago",
  },
  {
    id: "org_hsbc",
    name: "HSBC",
    industry: "Banking",
    subIndustry: "Retail & Corporate",
    hq: "London",
    country: "UK",
    countries: ["UK", "UAE", "Hong Kong", "USA"],
    employees: 220000,
    revenue: "$66.1B",
    founded: 1865,
    website: "hsbc.com",
    description: "Global bank with active innovation lab and branded flagship programme.",
    logo: "HS",
    tags: ["Banking", "Innovation"],
    scores: { lead: 62, innovation: 74, luxury: 60, tech: 82, priority: 68 },
    clientStatus: "Prospect",
    stage: "Prospect",
    owner: "L. Fischer",
    locations: 3900,
    updatedAt: "3 w ago",
  },
  {
    id: "org_bmw",
    name: "BMW Group",
    industry: "Automotive",
    subIndustry: "Luxury Automotive",
    hq: "Munich",
    country: "Germany",
    countries: ["Germany", "USA", "UAE", "China"],
    employees: 154000,
    revenue: "$168B",
    founded: 1916,
    website: "bmwgroup.com",
    description:
      "Parent to BMW, MINI and Rolls-Royce. Investing heavily in immersive brand experiences.",
    logo: "BM",
    tags: ["Automotive", "Luxury"],
    scores: { lead: 74, innovation: 82, luxury: 88, tech: 88, priority: 80 },
    clientStatus: "Prospect",
    stage: "Meeting",
    owner: "L. Fischer",
    locations: 1400,
    updatedAt: "2 d ago",
  },
  {
    id: "org_louvre_ad",
    name: "Louvre Abu Dhabi",
    industry: "Government",
    subIndustry: "Museum",
    hq: "Abu Dhabi",
    country: "UAE",
    countries: ["UAE"],
    employees: 320,
    revenue: "$120M",
    founded: 2017,
    website: "louvreabudhabi.ae",
    description: "Landmark museum on Saadiyat Island under DCT Abu Dhabi.",
    logo: "LA",
    tags: ["Culture", "Government"],
    scores: { lead: 60, innovation: 78, luxury: 90, tech: 72, priority: 70 },
    clientStatus: "Prospect",
    stage: "Qualified",
    owner: "R. Kaur",
    locations: 1,
    updatedAt: "5 d ago",
  },
  {
    id: "org_zaha",
    name: "Zaha Hadid Architects",
    industry: "Architecture",
    subIndustry: "Architecture Firm",
    hq: "London",
    country: "UK",
    countries: ["UK", "China", "UAE"],
    employees: 500,
    revenue: "$90M",
    founded: 1980,
    website: "zaha-hadid.com",
    description: "Parametric-forward architecture studio.",
    logo: "ZH",
    tags: ["Architecture"],
    scores: { lead: 58, innovation: 92, luxury: 84, tech: 84, priority: 66 },
    clientStatus: "Partner",
    stage: "Won",
    owner: "L. Fischer",
    locations: 4,
    updatedAt: "2 w ago",
  },
];

export const people: Person[] = [
  {
    id: "p_amina",
    firstName: "Amina",
    lastName: "Al Suwaidi",
    title: "Chief Innovation Officer",
    department: "Innovation",
    seniority: "C-Level",
    decisionMaker: "Economic",
    orgId: "org_dxb",
    email: "amina.suwaidi@dubaiairports.ae",
    phone: "+971 4 224 5000",
    linkedin: "linkedin.com/in/amina-al-suwaidi",
    city: "Dubai",
    country: "UAE",
    photoHue: 210,
    influence: 92,
    relationship: 84,
    lastInteraction: "2 d ago",
    tags: ["Champion", "Innovation"],
  },
  {
    id: "p_khalid",
    firstName: "Khalid",
    lastName: "Al Mheiri",
    title: "Managing Director, Retail",
    department: "Retail",
    seniority: "VP",
    decisionMaker: "Champion",
    orgId: "org_emaar",
    email: "k.mheiri@emaar.com",
    linkedin: "linkedin.com/in/khalid-mheiri",
    city: "Dubai",
    country: "UAE",
    photoHue: 190,
    influence: 88,
    relationship: 92,
    lastInteraction: "yesterday",
    tags: ["Existing Client"],
  },
  {
    id: "p_sophie",
    firstName: "Sophie",
    lastName: "Laurent",
    title: "Director of Experiential Retail",
    department: "Retail",
    seniority: "Director",
    decisionMaker: "Champion",
    orgId: "org_louis_vuitton",
    email: "sophie.laurent@louisvuitton.com",
    linkedin: "linkedin.com/in/sophielaurent",
    city: "Paris",
    country: "France",
    photoHue: 300,
    influence: 84,
    relationship: 62,
    lastInteraction: "1 w ago",
    tags: ["Priority"],
  },
  {
    id: "p_nadia",
    firstName: "Nadia",
    lastName: "Perez",
    title: "VP of Guest Experience",
    department: "Guest Experience",
    seniority: "VP",
    decisionMaker: "Influencer",
    orgId: "org_marriott",
    email: "nadia.perez@marriott.com",
    linkedin: "linkedin.com/in/nadiaperez",
    city: "Bethesda",
    country: "USA",
    photoHue: 40,
    influence: 71,
    relationship: 48,
    lastInteraction: "3 w ago",
    tags: [],
  },
  {
    id: "p_tarek",
    firstName: "Tarek",
    lastName: "Farouk",
    title: "Head of Strategic Projects",
    department: "Strategy",
    seniority: "Director",
    decisionMaker: "Champion",
    orgId: "org_neom",
    email: "tarek.farouk@neom.com",
    linkedin: "linkedin.com/in/tarekfarouk",
    city: "Riyadh",
    country: "Saudi Arabia",
    photoHue: 260,
    influence: 90,
    relationship: 70,
    lastInteraction: "4 d ago",
    tags: ["High Priority"],
  },
  {
    id: "p_yuki",
    firstName: "Yuki",
    lastName: "Tanaka",
    title: "Global Retail Director",
    department: "Retail",
    seniority: "Director",
    decisionMaker: "Influencer",
    orgId: "org_apple",
    email: "yuki.tanaka@apple.com",
    linkedin: "linkedin.com/in/yukitanaka",
    city: "Cupertino",
    country: "USA",
    photoHue: 180,
    influence: 88,
    relationship: 55,
    lastInteraction: "2 w ago",
    tags: [],
  },
  {
    id: "p_omar",
    firstName: "Omar",
    lastName: "Bin Sulayem",
    title: "SVP, Development",
    department: "Development",
    seniority: "VP",
    decisionMaker: "Economic",
    orgId: "org_meraas",
    email: "omar@meraas.com",
    linkedin: "linkedin.com/in/omarsulayem",
    city: "Dubai",
    country: "UAE",
    photoHue: 220,
    influence: 86,
    relationship: 88,
    lastInteraction: "3 d ago",
    tags: ["Existing Client"],
  },
  {
    id: "p_leila",
    firstName: "Leila",
    lastName: "Haddad",
    title: "Director of Brand Experience",
    department: "Brand",
    seniority: "Director",
    decisionMaker: "Champion",
    orgId: "org_hia",
    email: "leila.haddad@dohahamadairport.com",
    linkedin: "linkedin.com/in/leilahaddad",
    city: "Doha",
    country: "Qatar",
    photoHue: 340,
    influence: 78,
    relationship: 66,
    lastInteraction: "6 d ago",
    tags: ["Priority"],
  },
  {
    id: "p_hassan",
    firstName: "Hassan",
    lastName: "Al Ghamdi",
    title: "Head of Portfolio Development",
    department: "Portfolio",
    seniority: "VP",
    decisionMaker: "Economic",
    orgId: "org_pif",
    email: "hassan.ghamdi@pif.gov.sa",
    linkedin: "linkedin.com/in/hassan-ghamdi",
    city: "Riyadh",
    country: "Saudi Arabia",
    photoHue: 150,
    influence: 94,
    relationship: 58,
    lastInteraction: "10 d ago",
    tags: ["Sovereign"],
  },
  {
    id: "p_maya",
    firstName: "Maya",
    lastName: "Chen",
    title: "Partner, Retail Studio",
    department: "Retail Studio",
    seniority: "VP",
    decisionMaker: "Influencer",
    orgId: "org_foster",
    email: "m.chen@fosterandpartners.com",
    linkedin: "linkedin.com/in/mayachen",
    city: "London",
    country: "UK",
    photoHue: 20,
    influence: 82,
    relationship: 90,
    lastInteraction: "5 d ago",
    tags: ["Partner"],
  },
  {
    id: "p_daniel",
    firstName: "Daniel",
    lastName: "Weber",
    title: "Head of Brand Experience",
    department: "Brand",
    seniority: "Director",
    decisionMaker: "Champion",
    orgId: "org_bmw",
    email: "daniel.weber@bmwgroup.com",
    linkedin: "linkedin.com/in/danielweber",
    city: "Munich",
    country: "Germany",
    photoHue: 240,
    influence: 76,
    relationship: 52,
    lastInteraction: "2 w ago",
    tags: [],
  },
  {
    id: "p_rania",
    firstName: "Rania",
    lastName: "Kassem",
    title: "Director of Cultural Programming",
    department: "Programming",
    seniority: "Director",
    decisionMaker: "Influencer",
    orgId: "org_louvre_ad",
    email: "rania.kassem@louvreabudhabi.ae",
    linkedin: "linkedin.com/in/raniakassem",
    city: "Abu Dhabi",
    country: "UAE",
    photoHue: 310,
    influence: 68,
    relationship: 64,
    lastInteraction: "1 w ago",
    tags: [],
  },
];

export const relationships: Relationship[] = [
  { id: "r1", from: "p_khalid", fromType: "person", to: "org_emaar", toType: "org", type: "works_at", strength: 92, since: "2016" },
  { id: "r2", from: "p_amina", fromType: "person", to: "org_dxb", toType: "org", type: "works_at", strength: 90, since: "2019" },
  { id: "r3", from: "p_sophie", fromType: "person", to: "org_louis_vuitton", toType: "org", type: "works_at", strength: 78, since: "2021" },
  { id: "r4", from: "org_louis_vuitton", fromType: "org", to: "org_lvmh", toType: "org", type: "subsidiary_of", strength: 100 },
  { id: "r5", from: "org_qia", fromType: "org", to: "org_lvmh", toType: "org", type: "partner", strength: 60 },
  { id: "r6", from: "org_pif", fromType: "org", to: "org_neom", toType: "org", type: "owns", strength: 100 },
  { id: "r7", from: "p_tarek", fromType: "person", to: "org_neom", toType: "org", type: "works_at", strength: 88 },
  { id: "r8", from: "org_foster", fromType: "org", to: "org_apple", toType: "org", type: "designed", strength: 82 },
  { id: "r9", from: "p_maya", fromType: "person", to: "org_foster", toType: "org", type: "works_at", strength: 90 },
  { id: "r10", from: "org_emaar", fromType: "org", to: "org_dxb", toType: "org", type: "partner", strength: 62 },
  { id: "r11", from: "p_omar", fromType: "person", to: "org_meraas", toType: "org", type: "works_at", strength: 92 },
  { id: "r12", from: "p_hassan", fromType: "person", to: "org_pif", toType: "org", type: "works_at", strength: 84 },
  { id: "r13", from: "p_leila", fromType: "person", to: "org_hia", toType: "org", type: "works_at", strength: 80 },
  { id: "r14", from: "org_zaha", fromType: "org", to: "org_neom", toType: "org", type: "designed", strength: 74 },
  { id: "r15", from: "p_yuki", fromType: "person", to: "org_apple", toType: "org", type: "works_at", strength: 86 },
  { id: "r16", from: "p_daniel", fromType: "person", to: "org_bmw", toType: "org", type: "works_at", strength: 78 },
  { id: "r17", from: "p_nadia", fromType: "person", to: "org_marriott", toType: "org", type: "works_at", strength: 70 },
  { id: "r18", from: "p_rania", fromType: "person", to: "org_louvre_ad", toType: "org", type: "works_at", strength: 72 },
];

export const news: NewsItem[] = [
  { id: "n1", orgId: "org_neom", headline: "NEOM signs $2.1B contract for Trojena mountain resort", source: "Reuters", date: "2h ago", category: "Expansion" },
  { id: "n2", orgId: "org_emaar", headline: "Emaar announces third Dubai Hills district expansion", source: "Gulf News", date: "6h ago", category: "Expansion" },
  { id: "n3", orgId: "org_louis_vuitton", headline: "Louis Vuitton opens flagship on Champs-Élysées with immersive suite", source: "WWD", date: "1d ago", category: "Launch" },
  { id: "n4", orgId: "org_apple", headline: "Apple retail chief signals push into experiential concept stores", source: "Bloomberg", date: "2d ago", category: "Executive" },
  { id: "n5", orgId: "org_dxb", headline: "Dubai Airports awards experiential contract for Concourse D", source: "The National", date: "4d ago", category: "Expansion" },
  { id: "n6", orgId: "org_pif", headline: "PIF-backed Diriyah greenlights $63B masterplan", source: "Arab News", date: "1w ago", category: "Funding" },
];

export const opportunities: Opportunity[] = [
  { id: "o1", name: "NEOM Trojena — Immersive Gateway", orgId: "org_neom", stage: "Proposal", value: 4200000, probability: 65, closeDate: "Q2", owner: "N. Al Mansouri" },
  { id: "o2", name: "DXB Concourse D Experience", orgId: "org_dxb", stage: "Negotiation", value: 2800000, probability: 78, closeDate: "Q1", owner: "R. Kaur" },
  { id: "o3", name: "LV Champs-Élysées Suite v2", orgId: "org_louis_vuitton", stage: "Meeting", value: 1650000, probability: 45, closeDate: "Q3", owner: "N. Al Mansouri" },
  { id: "o4", name: "HIA Art & Retail Zone", orgId: "org_hia", stage: "Meeting", value: 1900000, probability: 40, closeDate: "Q3", owner: "R. Kaur" },
  { id: "o5", name: "Apple Vision Retail Pilot", orgId: "org_apple", stage: "Qualified", value: 950000, probability: 25, closeDate: "Q4", owner: "L. Fischer" },
  { id: "o6", name: "Meraas City Walk 4.0", orgId: "org_meraas", stage: "Won", value: 3300000, probability: 100, closeDate: "Q4", owner: "R. Kaur" },
  { id: "o7", name: "BMW Welt Experience", orgId: "org_bmw", stage: "Meeting", value: 1200000, probability: 35, closeDate: "Q4", owner: "L. Fischer" },
  { id: "o8", name: "HSBC Innovation Flagship", orgId: "org_hsbc", stage: "Prospect", value: 780000, probability: 15, closeDate: "Q4", owner: "L. Fischer" },
];

export const industries: OrgIndustry[] = [
  "Retail",
  "Aviation",
  "Hospitality",
  "Banking",
  "Real Estate",
  "Luxury",
  "Technology",
  "Automotive",
  "Government",
  "Architecture",
  "Media",
  "Healthcare",
];

export const pipelineStages: PipelineStage[] = [
  "Prospect",
  "Qualified",
  "Meeting",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

// Aggregate stats
export function getStats() {
  const totalRevenue = opportunities
    .filter((o) => o.stage !== "Lost")
    .reduce((s, o) => s + o.value * (o.probability / 100), 0);
  return {
    organizations: organizations.length,
    people: people.length,
    relationships: relationships.length,
    activeOpportunities: opportunities.filter((o) => o.stage !== "Won" && o.stage !== "Lost").length,
    weightedPipeline: totalRevenue,
  };
}

export function orgById(id: string) {
  return organizations.find((o) => o.id === id);
}
export function personById(id: string) {
  return people.find((p) => p.id === id);
}
export function peopleByOrg(orgId: string) {
  return people.filter((p) => p.orgId === orgId);
}
export function relationshipsFor(entityId: string) {
  return relationships.filter((r) => r.from === entityId || r.to === entityId);
}
export function newsFor(orgId: string) {
  return news.filter((n) => n.orgId === orgId);
}
export function opportunitiesFor(orgId: string) {
  return opportunities.filter((o) => o.orgId === orgId);
}
