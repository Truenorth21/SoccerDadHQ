import type { ListingKind } from "./listings";

/* ------------------------------------------------------------------ *
 *  Training centers, facilities, tournaments and camps outside Florida.
 *  Only real, established names: major tournaments and showcases, big
 *  public/club soccer complexes, college and pro-club camps, and academies.
 *  Dates, prices, field counts and contact details are deliberately left
 *  out — owners add them when they claim the profile.
 *
 *  Row: [name, state, regionSlug ("" = no region), city, zip, lat, lng,
 *        facet values (matching KIND_CONFIG facets, "" = unknown), about?]
 *  New rows go at the END of a kind's list so existing ids never shift.
 * ------------------------------------------------------------------ */
export interface NationalRawListing {
  name: string;
  state: string;
  region: string; // full key, e.g. "tx-dfw"; "" when none
  city: string;
  zip: string;
  lat: number;
  lng: number;
  tags: string[];
  about?: string;
}

type Row = [name: string, state: string, regionSlug: string, city: string, zip: string, lat: number, lng: number, facets: [string, string], about?: string];

function rows(list: Row[]): NationalRawListing[] {
  return list.map(([name, state, regionSlug, city, zip, lat, lng, facets, about]) => ({
    name,
    state,
    region: regionSlug ? `${state.toLowerCase()}-${regionSlug}` : "",
    city,
    zip,
    lat,
    lng,
    tags: facets.filter(Boolean),
    about,
  }));
}

export const NATIONAL_RAW_LISTINGS: Record<ListingKind, NationalRawListing[]> = {
  "training-center": rows([
    ["Barça Residency Academy", "AZ", "", "Casa Grande", "85122", 32.88, -111.76, ["", ""], "FC Barcelona's residential soccer academy in the United States, combining full-time training with high school academics."],
    ["TOCA Soccer Center Naperville", "IL", "chicagoland", "Naperville", "60563", 41.8, -88.15, ["Technical", "Both"], "Indoor TOCA Football center with technology-driven touch training, small-group classes and private sessions."],
    ["Zions Bank Real Academy", "UT", "", "Herriman", "84096", 40.5, -112.03, ["", ""], "Real Salt Lake's youth academy and training center campus."],
    ["Compass Minerals National Performance Center", "KS", "", "Kansas City", "66111", 39.12, -94.82, ["", ""], "Sporting Kansas City's training complex, also used by U.S. Soccer."],
  ]),

  facility: rows([
    // Texas
    ["Toyota Soccer Center", "TX", "dfw", "Frisco", "75034", 33.15, -96.84, ["", "Complex"], "Multi-field complex next to Toyota Stadium; home of FC Dallas youth and host of national events."],
    ["MoneyGram Soccer Park", "TX", "dfw", "Dallas", "75212", 32.79, -96.88, ["", "Complex"], "City of Dallas soccer complex and a long-time Dallas Cup venue."],
    ["Houston Sports Park", "TX", "houston", "Houston", "77047", 29.62, -95.38, ["", "Complex"], "Large soccer complex in south Houston used by the Houston Dynamo and Dash and for youth tournaments."],
    ["Round Rock Multipurpose Complex", "TX", "austin-san-antonio", "Round Rock", "78665", 30.55, -97.62, ["Turf", "Complex"], "City-owned tournament complex north of Austin."],
    ["STAR Soccer Complex", "TX", "san-antonio", "San Antonio", "78219", 29.45, -98.4, ["", "Complex"], "Bexar County soccer complex that hosts youth leagues and tournaments."],
    // North Carolina
    ["WakeMed Soccer Park", "NC", "triangle", "Cary", "27519", 35.79, -78.85, ["", "Complex"], "Stadium and multi-field park, a regular host of college championships and youth showcases."],
    ["Mecklenburg County Sportsplex", "NC", "charlotte", "Matthews", "28105", 35.13, -80.68, ["Turf", "Complex"], "County tournament complex southeast of Charlotte."],
    ["Bryan Park Soccer Complex", "NC", "triad", "Browns Summit", "27214", 36.17, -79.73, ["", "Complex"], "Multi-field complex near Greensboro used for many regional tournaments."],
    // South Carolina
    ["Patriots Point Soccer Complex", "SC", "charleston", "Mount Pleasant", "29464", 32.79, -79.9, ["", "Complex"], "Fields across the harbor from downtown Charleston, home of the College of Charleston and youth events."],
    ["Tyger River Park", "SC", "greenville-upstate", "Duncan", "29334", 34.93, -82.12, ["", "Complex"], "Upstate multi-field park built for tournaments between Greenville and Spartanburg."],
    // Tennessee
    ["Richard Siegel Soccer Complex", "TN", "nashville", "Murfreesboro", "37129", 35.87, -86.43, ["", "Complex"], "City soccer complex in Murfreesboro and a regular tournament site."],
    ["Mike Rose Soccer Complex", "TN", "memphis", "Memphis", "38125", 35.04, -89.79, ["", "Complex"], "Shelby County's tournament soccer complex in southeast Memphis."],
    ["Camp Jordan Park", "TN", "chattanooga", "East Ridge", "37412", 35.0, -85.22, ["", "Complex"], "Sports park near Chattanooga with multiple soccer fields."],
    // California
    ["Great Park Sports Complex", "CA", "la-socal", "Irvine", "92618", 33.67, -117.74, ["", "Complex"], "City of Irvine complex with a championship soccer stadium and many tournament fields."],
    ["SilverLakes Sports Complex", "CA", "la-socal", "Norco", "92860", 33.94, -117.57, ["Grass", "Complex"], "One of Southern California's largest field complexes, used for major youth tournaments."],
    ["Surf Cup Sports Park", "CA", "san-diego", "Del Mar", "92014", 32.96, -117.24, ["Grass", "Complex"], "Home of the Surf Cup tournaments next to the Del Mar Fairgrounds."],
    ["Twin Creeks Sports Complex", "CA", "bay-area-norcal", "Sunnyvale", "94089", 37.41, -122.0, ["", "Complex"], "Long-running Bay Area complex used by clubs and tournaments."],
    ["Morgan Hill Outdoor Sports Center", "CA", "bay-area-norcal", "Morgan Hill", "95037", 37.17, -121.64, ["", "Complex"], "South Bay soccer complex that hosts tournaments and showcases."],
    ["Cherry Island Soccer Complex", "CA", "sacramento", "Elverta", "95626", 38.71, -121.4, ["", "Complex"], "Sacramento County soccer complex used for league play and tournaments."],
    // New York / New Jersey
    ["Randall's Island Park Fields", "NY", "nyc-metro", "New York", "10035", 40.79, -73.92, ["", "Complex"], "The largest collection of fields in Manhattan, used by many NYC youth clubs."],
    ["Eisenhower Park", "NY", "long-island", "East Meadow", "11554", 40.73, -73.57, ["", "Complex"], "Nassau County park with soccer fields used by Long Island leagues and tournaments."],
    ["Mercer County Park", "NJ", "central-nj", "West Windsor", "08550", 40.27, -74.63, ["", "Complex"], "Large county park with multiple soccer fields and a frequent tournament host."],
    ["Overpeck County Park", "NJ", "north-nj", "Leonia", "07605", 40.87, -73.99, ["", "Complex"], "Bergen County park with soccer fields used by North Jersey clubs."],
    // Mid-Atlantic
    ["Maryland SoccerPlex", "MD", "dc-suburbs", "Boyds", "20841", 39.17, -77.3, ["Both", "Complex"], "Montgomery County's large soccer campus and a regular showcase host."],
    ["Hampton Roads Soccer Complex", "VA", "hampton-roads", "Virginia Beach", "23456", 36.77, -76.11, ["", "Complex"], "Virginia Beach tournament complex used by Hampton Roads clubs."],
    ["River City Sportsplex", "VA", "richmond", "Midlothian", "23112", 37.43, -77.67, ["", "Complex"], "Chesterfield County soccer complex and a Richmond-area tournament venue."],
    // Midwest
    ["Dodds Park", "IL", "central-il", "Champaign", "61822", 40.13, -88.28, ["", "Complex"], "Champaign Park District's main soccer complex."],
    ["Lou Berliner Sports Park", "OH", "columbus", "Columbus", "43207", 39.92, -82.99, ["", "Complex"], "City of Columbus park with many soccer fields near downtown."],
    ["Grand Park Sports Campus", "IN", "", "Westfield", "46074", 40.05, -86.15, ["Both", "Complex"], "One of the largest youth sports campuses in the country, with dozens of soccer fields and an indoor event center."],
    ["Overland Park Soccer Complex", "KS", "", "Overland Park", "66221", 38.85, -94.71, ["Turf", "Complex"], "Turf complex that hosts Heartland Soccer leagues and tournaments."],
    ["Swope Soccer Village", "MO", "", "Kansas City", "64132", 38.99, -94.53, ["", "Complex"], "Kansas City soccer complex in Swope Park used for youth leagues and tournaments."],
    ["World Wide Technology Soccer Park", "MO", "", "Fenton", "63026", 38.51, -90.44, ["", "Complex"], "St. Louis County soccer park and a regular regional tournament venue."],
    ["National Sports Center", "MN", "", "Blaine", "55449", 45.15, -93.2, ["Both", "Complex"], "Home of the USA CUP, with dozens of soccer fields north of Minneapolis."],
    ["Uihlein Soccer Park", "WI", "", "Milwaukee", "53224", 43.16, -88.05, ["Both", "Complex"], "Milwaukee soccer complex with indoor and outdoor fields."],
    ["Ultimate Soccer Arenas", "MI", "", "Pontiac", "48341", 42.63, -83.28, ["Indoor", "Indoor arena"], "Large indoor soccer facility in Oakland County."],
    ["Cownie Soccer Park", "IA", "", "Des Moines", "50320", 41.54, -93.56, ["", "Complex"], "Des Moines' main youth soccer complex."],
    ["Tranquility Park", "NE", "", "Omaha", "68164", 41.3, -96.11, ["", "Complex"], "Omaha's big youth soccer complex."],
    // Mountain / West
    ["Dick's Sporting Goods Park", "CO", "denver-metro", "Commerce City", "80022", 39.81, -104.89, ["Grass", "Complex"], "Colorado Rapids stadium surrounded by youth soccer fields used for tournaments."],
    ["Aurora Sports Park", "CO", "denver-metro", "Aurora", "80018", 39.71, -104.71, ["", "Complex"], "City of Aurora tournament complex east of Denver."],
    ["Reach 11 Sports Complex", "AZ", "phoenix-west", "Phoenix", "85054", 33.68, -112.0, ["", "Complex"], "North Phoenix complex that hosts national showcases."],
    ["Bell Bank Park", "AZ", "east-valley", "Mesa", "85212", 33.33, -111.65, ["Both", "Complex"], "Large Mesa sports campus with outdoor fields and an indoor arena."],
    ["Kino Sports Complex", "AZ", "tucson-southern", "Tucson", "85713", 32.17, -110.93, ["", "Complex"], "Pima County complex with a stadium and many soccer fields."],
    ["Starfire Sports", "WA", "seattle-eastside", "Tukwila", "98188", 47.47, -122.25, ["Turf", "Complex"], "Soccer complex south of Seattle used by clubs, leagues and tournaments."],
    ["Regional Athletic Complex", "UT", "", "Salt Lake City", "84116", 40.8, -111.95, ["", "Complex"], "Salt Lake City's multi-field complex for youth tournaments."],
    ["Kellogg Zaher Sports Complex", "NV", "", "Las Vegas", "89128", 36.19, -115.27, ["", "Complex"], "Las Vegas park with soccer fields used for major tournaments."],
    ["Delta Park", "OR", "", "Portland", "97217", 45.6, -122.68, ["", "Complex"], "Portland park with many soccer fields used by local clubs."],
    ["Simplot Sports Complex", "ID", "", "Boise", "83709", 43.57, -116.29, ["", "Complex"], "Boise's large field complex used for youth soccer."],
    ["Waipio Peninsula Soccer Complex", "HI", "", "Waipahu", "96797", 21.39, -157.99, ["", "Complex"], "Oahu's main tournament soccer complex."],
    // South
    ["John Hunt Park", "AL", "", "Huntsville", "35805", 34.7, -86.6, ["", "Complex"], "Huntsville's main soccer complex."],
    ["Hoover Met Complex", "AL", "", "Hoover", "35244", 33.37, -86.82, ["", "Complex"], "Hoover's sports complex with turf fields used for soccer events."],
    ["DE Turf Sports Complex", "DE", "", "Frederica", "19946", 39.03, -75.46, ["Turf", "Complex"], "Delaware's turf tournament complex."],
  ]),

  tournament: rows([
    ["Dallas Cup", "TX", "dfw", "Dallas", "75212", 32.79, -96.88, ["Cup", "National"], "One of the oldest international youth soccer tournaments in the U.S., played each spring around Dallas."],
    ["Generation adidas Cup", "TX", "dfw", "Frisco", "75034", 33.15, -96.84, ["Cup", "National"], "MLS NEXT's international youth tournament, played at Toyota Soccer Center."],
    ["Surf Cup", "CA", "san-diego", "Del Mar", "92014", 32.96, -117.24, ["Showcase", "College Showcase"], "Major San Diego tournament and college showcase held at Surf Cup Sports Park."],
    ["Albion Cup", "CA", "san-diego", "San Diego", "92101", 32.72, -117.16, ["Cup", "Regional"], "Albion SC San Diego's annual tournament."],
    ["Las Vegas Mayor's Cup", "NV", "", "Las Vegas", "89128", 36.19, -115.27, ["Showcase", "College Showcase"], "Large Las Vegas showcase with heavy college-coach attendance."],
    ["Jefferson Cup", "VA", "richmond", "Richmond", "23233", 37.64, -77.6, ["Showcase", "College Showcase"], "Richmond Strikers' showcase, one of the largest college showcases on the East Coast."],
    ["WAGS Tournament", "VA", "northern-va-dc-metro", "Fairfax", "22030", 38.85, -77.31, ["Showcase", "College Showcase"], "Washington Area Girls Soccer tournament and showcase."],
    ["Bethesda Premier Cup", "MD", "dc-suburbs", "Boyds", "20841", 39.17, -77.3, ["Cup", "Regional"], "Bethesda SC's tournament at the Maryland SoccerPlex."],
    ["Baltimore Mania", "MD", "baltimore", "Baltimore", "21228", 39.28, -76.73, ["Cup", "Regional"], "Long-running Baltimore-area summer tournament."],
    ["PA Classics Showcase", "PA", "central-pa", "Manheim", "17545", 40.16, -76.4, ["Showcase", "College Showcase"], "PA Classics' college showcase in Lancaster County."],
    ["Lake Placid Summit Classic", "NY", "upstate-ny", "Lake Placid", "12946", 44.28, -73.98, ["Cup", "Regional"], "Summer tournament in the Adirondacks."],
    ["Fort Lowell Shootout", "AZ", "tucson-southern", "Tucson", "85713", 32.17, -110.93, ["Cup", "Regional"], "Tucson's long-running winter tournament."],
    ["Crossfire Challenge", "WA", "seattle-eastside", "Redmond", "98052", 47.67, -122.12, ["Cup", "Regional"], "Crossfire Premier's tournament on the Eastside."],
    ["USA CUP", "MN", "", "Blaine", "55449", 45.15, -93.2, ["Cup", "National"], "One of the largest youth soccer tournaments in the Western Hemisphere, held each July at the National Sports Center."],
    ["Heartland Invitational", "KS", "", "Overland Park", "66221", 38.85, -94.71, ["Cup", "Regional"], "Heartland Soccer Association's tournament in the Kansas City area."],
  ]),

  camp: rows([
    // College ID camps (run by the college programs; check each program for current dates)
    ["SMU Soccer Camps", "TX", "dfw", "Dallas", "75275", 32.84, -96.78, ["ID camp", "College ID"]],
    ["Texas A&M Soccer Camps", "TX", "", "College Station", "77843", 30.61, -96.34, ["ID camp", "College ID"]],
    ["University of Georgia Soccer Camps", "GA", "north-georgia", "Athens", "30602", 33.95, -83.37, ["ID camp", "College ID"]],
    ["Kennesaw State Soccer Camps", "GA", "atlanta-metro", "Kennesaw", "30144", 34.03, -84.58, ["ID camp", "College ID"]],
    ["UNC Soccer Camps", "NC", "triangle", "Chapel Hill", "27599", 35.9, -79.05, ["ID camp", "College ID"]],
    ["Duke Soccer Camps", "NC", "triangle", "Durham", "27708", 36.0, -78.94, ["ID camp", "College ID"]],
    ["Wake Forest Soccer Camps", "NC", "triad", "Winston-Salem", "27109", 36.13, -80.28, ["ID camp", "College ID"]],
    ["Clemson Soccer Camps", "SC", "greenville-upstate", "Clemson", "29634", 34.68, -82.84, ["ID camp", "College ID"]],
    ["Furman Soccer Camps", "SC", "greenville-upstate", "Greenville", "29613", 34.93, -82.44, ["ID camp", "College ID"]],
    ["Vanderbilt Soccer Camps", "TN", "nashville", "Nashville", "37212", 36.14, -86.8, ["ID camp", "College ID"]],
    ["University of Tennessee Soccer Camps", "TN", "knoxville", "Knoxville", "37996", 35.95, -83.93, ["ID camp", "College ID"]],
    ["UCLA Soccer Camps", "CA", "la-socal", "Los Angeles", "90095", 34.07, -118.44, ["ID camp", "College ID"]],
    ["Stanford Soccer Camps", "CA", "bay-area-norcal", "Stanford", "94305", 37.43, -122.17, ["ID camp", "College ID"]],
    ["Santa Clara Soccer Camps", "CA", "bay-area-norcal", "Santa Clara", "95053", 37.35, -121.94, ["ID camp", "College ID"]],
    ["Syracuse Soccer Camps", "NY", "upstate-ny", "Syracuse", "13244", 43.04, -76.13, ["ID camp", "College ID"]],
    ["Rutgers Soccer Camps", "NJ", "central-nj", "Piscataway", "08854", 40.52, -74.46, ["ID camp", "College ID"]],
    ["Princeton Soccer Camps", "NJ", "central-nj", "Princeton", "08544", 40.35, -74.65, ["ID camp", "College ID"]],
    ["University of Virginia Soccer Camps", "VA", "", "Charlottesville", "22903", 38.03, -78.51, ["ID camp", "College ID"]],
    ["Virginia Tech Soccer Camps", "VA", "", "Blacksburg", "24061", 37.23, -80.42, ["ID camp", "College ID"]],
    ["University of Maryland Soccer Camps", "MD", "dc-suburbs", "College Park", "20742", 38.99, -76.94, ["ID camp", "College ID"]],
    ["Penn State Soccer Camps", "PA", "central-pa", "State College", "16802", 40.8, -77.86, ["ID camp", "College ID"]],
    ["Northwestern Soccer Camps", "IL", "chicagoland", "Evanston", "60208", 42.06, -87.68, ["ID camp", "College ID"]],
    ["Ohio State Soccer Camps", "OH", "columbus", "Columbus", "43210", 40.0, -83.03, ["ID camp", "College ID"]],
    ["Akron Soccer Camps", "OH", "cleveland-ne", "Akron", "44325", 41.08, -81.51, ["ID camp", "College ID"]],
    ["University of Washington Soccer Camps", "WA", "seattle-eastside", "Seattle", "98195", 47.65, -122.3, ["ID camp", "College ID"]],
    ["University of Denver Soccer Camps", "CO", "denver-metro", "Denver", "80208", 39.68, -104.96, ["ID camp", "College ID"]],
    ["Grand Canyon University Soccer Camps", "AZ", "phoenix-west", "Phoenix", "85017", 33.51, -112.13, ["ID camp", "College ID"]],
    ["Harvard Soccer Camps", "MA", "boston-metro", "Cambridge", "02138", 42.37, -71.12, ["ID camp", "College ID"]],
    ["Boston College Soccer Camps", "MA", "boston-metro", "Chestnut Hill", "02467", 42.34, -71.17, ["ID camp", "College ID"]],
    ["Indiana University Soccer Camps", "IN", "", "Bloomington", "47405", 39.17, -86.52, ["ID camp", "College ID"]],
    ["Notre Dame Soccer Camps", "IN", "", "Notre Dame", "46556", 41.7, -86.24, ["ID camp", "College ID"]],
    ["University of Louisville Soccer Camps", "KY", "", "Louisville", "40292", 38.21, -85.76, ["ID camp", "College ID"]],
    ["University of Kentucky Soccer Camps", "KY", "", "Lexington", "40506", 38.03, -84.5, ["ID camp", "College ID"]],
    ["Saint Louis University Soccer Camps", "MO", "", "St. Louis", "63103", 38.64, -90.23, ["ID camp", "College ID"]],
    ["Creighton Soccer Camps", "NE", "", "Omaha", "68178", 41.27, -95.95, ["ID camp", "College ID"]],
    ["University of Michigan Soccer Camps", "MI", "", "Ann Arbor", "48109", 42.28, -83.74, ["ID camp", "College ID"]],
    ["Michigan State Soccer Camps", "MI", "", "East Lansing", "48824", 42.73, -84.48, ["ID camp", "College ID"]],
    ["University of Wisconsin Soccer Camps", "WI", "", "Madison", "53706", 43.07, -89.41, ["ID camp", "College ID"]],
    ["University of Minnesota Soccer Camps", "MN", "", "Minneapolis", "55455", 44.97, -93.23, ["ID camp", "College ID"]],
    ["University of Alabama Soccer Camps", "AL", "", "Tuscaloosa", "35487", 33.21, -87.54, ["ID camp", "College ID"]],
    ["LSU Soccer Camps", "LA", "", "Baton Rouge", "70803", 30.41, -91.18, ["ID camp", "College ID"]],
    ["University of Arkansas Soccer Camps", "AR", "", "Fayetteville", "72701", 36.07, -94.17, ["ID camp", "College ID"]],
    ["Ole Miss Soccer Camps", "MS", "", "Oxford", "38677", 34.36, -89.54, ["ID camp", "College ID"]],
    ["BYU Soccer Camps", "UT", "", "Provo", "84602", 40.25, -111.65, ["ID camp", "College ID"]],
    ["University of Portland Soccer Camps", "OR", "", "Portland", "97203", 45.57, -122.73, ["ID camp", "College ID"]],
    ["UConn Soccer Camps", "CT", "", "Storrs", "06269", 41.81, -72.25, ["ID camp", "College ID"]],
    ["West Virginia University Soccer Camps", "WV", "", "Morgantown", "26506", 39.65, -79.96, ["ID camp", "College ID"]],
    ["University of Delaware Soccer Camps", "DE", "", "Newark", "19716", 39.68, -75.75, ["ID camp", "College ID"]],
    ["University of New Mexico Soccer Camps", "NM", "", "Albuquerque", "87131", 35.08, -106.62, ["ID camp", "College ID"]],
    ["University of Oklahoma Soccer Camps", "OK", "", "Norman", "73019", 35.21, -97.44, ["ID camp", "College ID"]],
    ["UNH Soccer Camps", "NH", "", "Durham", "03824", 43.14, -70.93, ["ID camp", "College ID"]],
    ["Providence College Soccer Camps", "RI", "", "Providence", "02918", 41.84, -71.44, ["ID camp", "College ID"]],
    ["UVM Soccer Camps", "VT", "", "Burlington", "05405", 44.48, -73.2, ["ID camp", "College ID"]],
    ["University of Maine Soccer Camps", "ME", "", "Orono", "04469", 44.9, -68.67, ["ID camp", "College ID"]],
    ["University of Montana Soccer Camps", "MT", "", "Missoula", "59812", 46.86, -113.98, ["ID camp", "College ID"]],
    ["University of North Dakota Soccer Camps", "ND", "", "Grand Forks", "58202", 47.92, -97.07, ["ID camp", "College ID"]],
    ["South Dakota State Soccer Camps", "SD", "", "Brookings", "57007", 44.32, -96.78, ["ID camp", "College ID"]],
    ["University of Wyoming Soccer Camps", "WY", "", "Laramie", "82071", 41.31, -105.57, ["ID camp", "College ID"]],
    // Pro-club youth camps
    ["FC Dallas Youth Camps", "TX", "dfw", "Frisco", "75034", 33.15, -96.84, ["Day", "Skills"]],
    ["Houston Dynamo Youth Camps", "TX", "houston", "Houston", "77003", 29.75, -95.35, ["Day", "Skills"]],
    ["Atlanta United Youth Camps", "GA", "atlanta-metro", "Atlanta", "30313", 33.76, -84.4, ["Day", "Skills"]],
    ["Charlotte FC Youth Camps", "NC", "charlotte", "Charlotte", "28203", 35.21, -80.85, ["Day", "Skills"]],
    ["Nashville SC Youth Camps", "TN", "nashville", "Nashville", "37203", 36.13, -86.77, ["Day", "Skills"]],
    ["LA Galaxy Youth Camps", "CA", "la-socal", "Carson", "90746", 33.86, -118.26, ["Day", "Skills"]],
    ["San Jose Earthquakes Youth Camps", "CA", "bay-area-norcal", "San Jose", "95110", 37.35, -121.92, ["Day", "Skills"]],
    ["New York Red Bulls Youth Camps", "NJ", "north-nj", "Harrison", "07029", 40.74, -74.15, ["Day", "Skills"]],
    ["Philadelphia Union Youth Camps", "PA", "philadelphia", "Chester", "19013", 39.83, -75.38, ["Day", "Skills"]],
    ["Chicago Fire Youth Camps", "IL", "chicagoland", "Chicago", "60605", 41.86, -87.62, ["Day", "Skills"]],
    ["Columbus Crew Youth Camps", "OH", "columbus", "Columbus", "43215", 39.97, -83.02, ["Day", "Skills"]],
    ["FC Cincinnati Youth Camps", "OH", "cincinnati-dayton", "Cincinnati", "45214", 39.11, -84.52, ["Day", "Skills"]],
    ["Seattle Sounders Youth Camps", "WA", "seattle-eastside", "Seattle", "98134", 47.6, -122.33, ["Day", "Skills"]],
    ["Colorado Rapids Youth Camps", "CO", "denver-metro", "Commerce City", "80022", 39.81, -104.89, ["Day", "Skills"]],
    ["New England Revolution Youth Camps", "MA", "south-shore-cape", "Foxborough", "02035", 42.09, -71.26, ["Day", "Skills"]],
    ["Sporting KC Youth Camps", "KS", "", "Kansas City", "66111", 39.12, -94.82, ["Day", "Skills"]],
    ["St. Louis CITY SC Youth Camps", "MO", "", "St. Louis", "63103", 38.63, -90.21, ["Day", "Skills"]],
    ["Minnesota United Youth Camps", "MN", "", "St. Paul", "55104", 44.95, -93.17, ["Day", "Skills"]],
    ["Real Salt Lake Youth Camps", "UT", "", "Sandy", "84070", 40.58, -111.89, ["Day", "Skills"]],
    ["Portland Timbers Youth Camps", "OR", "", "Portland", "97205", 45.52, -122.69, ["Day", "Skills"]],
  ]),
};
