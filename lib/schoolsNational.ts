/* ------------------------------------------------------------------ *
 *  National high school seed: about 20 real high school soccer programs
 *  in ten states with predefined regions (TX, GA, NC, SC, TN, CA, NY, NJ,
 *  VA, IL), spread across that state's regions. Every school competes
 *  under its state association (UIL, GHSA, NCHSAA, SCHSL, TSSAA, CIF,
 *  NYSPHSAA, NJSIAA, VHSL, IHSA), so private schools that play in a
 *  separate independent-school league (VISAA, NCISAA, SCISA, TAPPS) and
 *  NYC PSAL / CHSAA schools are left out on purpose.
 *
 *  Like the national club seed these are unclaimed directory entries:
 *  classification, district, coaches, enrollment and titles are left blank
 *  rather than guessed, and schools fill them in when they claim the
 *  profile. Coordinates are city-level. New states are appended at the end
 *  so existing school ids stay stable.
 * ------------------------------------------------------------------ */

export interface NationalRawSchool {
  name: string;
  state: string; // two-letter code
  region: string; // full region key, e.g. "tx-dfw"
  city: string;
  zip: string;
  lat: number;
  lng: number;
  type: "Public" | "Private";
  mascot: string;
  programs: string[]; // ["Boys","Girls"] unless single-sex
}

type Row = [name: string, regionSlug: string, city: string, zip: string, lat: number, lng: number, type: "Public" | "Private", mascot: string, programs?: string[]];

const P = "Public" as const;
const PV = "Private" as const;
const BOYS = ["Boys"];
const GIRLS = ["Girls"];

function state(code: string, rows: Row[]): NationalRawSchool[] {
  const prefix = code.toLowerCase();
  return rows.map(([name, regionSlug, city, zip, lat, lng, type, mascot, programs]) => ({
    name,
    state: code,
    region: `${prefix}-${regionSlug}`,
    city,
    zip,
    lat,
    lng,
    type,
    mascot,
    programs: programs ?? ["Boys", "Girls"],
  }));
}

export const NATIONAL_RAW_SCHOOLS: NationalRawSchool[] = [
  // ---------------------------- Texas (UIL) ----------------------------
  ...state("TX", [
    ["Jesuit College Preparatory School of Dallas", "dfw", "Dallas", "75244", 32.9248, -96.8320, PV, "Rangers", BOYS],
    ["Plano West Senior High School", "dfw", "Plano", "75093", 33.0430, -96.8180, P, "Wolves"],
    ["Coppell High School", "dfw", "Coppell", "75019", 32.9671, -96.9895, P, "Cowboys"],
    ["Carroll Senior High School", "dfw", "Southlake", "76092", 32.9412, -97.1342, P, "Dragons"],
    ["Allen High School", "dfw", "Allen", "75002", 33.1032, -96.6706, P, "Eagles"],
    ["Highland Park High School", "dfw", "Dallas", "75205", 32.8360, -96.7920, P, "Scots"],
    ["Strake Jesuit College Preparatory", "houston", "Houston", "77036", 29.7135, -95.5246, PV, "Crusaders", BOYS],
    ["Memorial High School", "houston", "Houston", "77024", 29.7738, -95.5199, P, "Mustangs"],
    ["The Woodlands High School", "houston", "The Woodlands", "77382", 30.1855, -95.5205, P, "Highlanders"],
    ["Clear Lake High School", "houston", "Houston", "77062", 29.5735, -95.1260, P, "Falcons"],
    ["Katy High School", "houston", "Katy", "77493", 29.7858, -95.8245, P, "Tigers"],
    ["Westlake High School", "austin-san-antonio", "Austin", "78746", 30.2810, -97.8090, P, "Chaparrals"],
    ["Lake Travis High School", "austin-san-antonio", "Austin", "78738", 30.3470, -97.9580, P, "Cavaliers"],
    ["Round Rock High School", "austin-san-antonio", "Round Rock", "78681", 30.5083, -97.6789, P, "Dragons"],
    ["Vandegrift High School", "austin-san-antonio", "Austin", "78726", 30.4510, -97.8350, P, "Vipers"],
    ["Ronald Reagan High School", "san-antonio", "San Antonio", "78258", 29.6277, -98.4790, P, "Rattlers"],
    ["Alamo Heights High School", "san-antonio", "San Antonio", "78209", 29.4846, -98.4656, P, "Mules"],
    ["Brandeis High School", "san-antonio", "San Antonio", "78254", 29.5390, -98.6930, P, "Broncos"],
    ["Coronado High School", "west-texas", "El Paso", "79912", 31.8590, -106.5780, P, "Thunderbirds"],
    ["Monterey High School", "west-texas", "Lubbock", "79413", 33.5470, -101.8930, P, "Plainsmen"],
  ]),

  // ---------------------------- Georgia (GHSA) ----------------------------
  ...state("GA", [
    ["Marist School", "atlanta-metro", "Atlanta", "30319", 33.8890, -84.3220, PV, "War Eagles"],
    ["The Westminster Schools", "atlanta-metro", "Atlanta", "30327", 33.8270, -84.4110, PV, "Wildcats"],
    ["Lambert High School", "atlanta-metro", "Suwanee", "30024", 34.1500, -84.1730, P, "Longhorns"],
    ["North Gwinnett High School", "atlanta-metro", "Suwanee", "30024", 34.0700, -84.0570, P, "Bulldogs"],
    ["Walton High School", "atlanta-metro", "Marietta", "30062", 33.9900, -84.4220, P, "Raiders"],
    ["Milton High School", "atlanta-metro", "Milton", "30004", 34.0870, -84.3330, P, "Eagles"],
    ["Brookwood High School", "atlanta-metro", "Snellville", "30039", 33.8700, -84.0160, P, "Broncos"],
    ["Pope High School", "atlanta-metro", "Marietta", "30068", 33.9940, -84.4560, P, "Greyhounds"],
    ["McIntosh High School", "atlanta-metro", "Peachtree City", "30269", 33.3960, -84.5700, P, "Chiefs"],
    ["Gainesville High School (Georgia)", "north-georgia", "Gainesville", "30501", 34.2980, -83.8240, P, "Red Elephants"],
    ["North Oconee High School", "north-georgia", "Bogart", "30622", 33.9050, -83.4720, P, "Titans"],
    ["Darlington School", "north-georgia", "Rome", "30161", 34.2420, -85.1860, PV, "Tigers"],
    ["Dalton High School", "north-georgia", "Dalton", "30720", 34.7700, -84.9700, P, "Catamounts"],
    ["Savannah Country Day School", "savannah-coastal", "Savannah", "31406", 31.9890, -81.0960, PV, "Hornets"],
    ["Benedictine Military School", "savannah-coastal", "Savannah", "31419", 31.9930, -81.1610, PV, "Cadets", BOYS],
    ["Richmond Hill High School", "savannah-coastal", "Richmond Hill", "31324", 31.9380, -81.3030, P, "Wildcats"],
    ["Glynn Academy", "savannah-coastal", "Brunswick", "31520", 31.1500, -81.4920, P, "Red Terrors"],
    ["Houston County High School", "middle-georgia", "Warner Robins", "31088", 32.5450, -83.6680, P, "Bears"],
    ["Veterans High School", "middle-georgia", "Kathleen", "31047", 32.4960, -83.7500, P, "Warhawks"],
    ["Columbus High School", "middle-georgia", "Columbus", "31904", 32.5110, -84.9640, P, "Blue Devils"],
  ]),

  // ---------------------------- North Carolina (NCHSAA) ----------------------------
  ...state("NC", [
    ["Charlotte Catholic High School", "charlotte", "Charlotte", "28226", 35.0920, -80.8070, PV, "Cougars"],
    ["Ardrey Kell High School", "charlotte", "Charlotte", "28277", 35.0420, -80.8250, P, "Knights"],
    ["Myers Park High School", "charlotte", "Charlotte", "28209", 35.1720, -80.8270, P, "Mustangs"],
    ["Providence High School", "charlotte", "Charlotte", "28270", 35.1050, -80.7440, P, "Panthers"],
    ["William Amos Hough High School", "charlotte", "Cornelius", "28031", 35.4710, -80.8480, P, "Huskies"],
    ["Marvin Ridge High School", "charlotte", "Waxhaw", "28173", 34.9930, -80.7170, P, "Mavericks"],
    ["Cardinal Gibbons High School (Raleigh)", "triangle", "Raleigh", "27607", 35.8050, -78.7240, PV, "Crusaders"],
    ["Green Hope High School", "triangle", "Cary", "27519", 35.7960, -78.8860, P, "Falcons"],
    ["Panther Creek High School", "triangle", "Cary", "27519", 35.8310, -78.8770, P, "Catamounts"],
    ["Apex High School", "triangle", "Apex", "27502", 35.7330, -78.8500, P, "Cougars"],
    ["Leesville Road High School", "triangle", "Raleigh", "27613", 35.8960, -78.7240, P, "Pride"],
    ["Chapel Hill High School", "triangle", "Chapel Hill", "27516", 35.9300, -79.0700, P, "Tigers"],
    ["Charles E. Jordan High School", "triangle", "Durham", "27713", 35.9310, -78.9300, P, "Falcons"],
    ["Grimsley High School", "triad", "Greensboro", "27408", 36.0870, -79.8240, P, "Whirlies"],
    ["Walter Hines Page High School", "triad", "Greensboro", "27405", 36.1010, -79.7720, P, "Pirates"],
    ["Northwest Guilford High School", "triad", "Greensboro", "27410", 36.1500, -79.9300, P, "Vikings"],
    ["Ronald Wilson Reagan High School", "triad", "Pfafftown", "27040", 36.1640, -80.3780, P, "Raiders"],
    ["John T. Hoggard High School", "wilmington", "Wilmington", "28403", 34.2190, -77.8650, P, "Vikings"],
    ["Emsley A. Laney High School", "wilmington", "Wilmington", "28411", 34.2920, -77.8210, P, "Buccaneers"],
    ["Eugene Ashley High School", "wilmington", "Wilmington", "28409", 34.1400, -77.8930, P, "Screaming Eagles"],
  ]),

  // ---------------------------- South Carolina (SCHSL) ----------------------------
  ...state("SC", [
    ["Bishop England High School", "charleston", "Charleston", "29492", 32.8620, -79.9100, PV, "Battling Bishops"],
    ["Wando High School", "charleston", "Mount Pleasant", "29466", 32.8730, -79.8050, P, "Warriors"],
    ["Academic Magnet High School", "charleston", "North Charleston", "29405", 32.8660, -79.9850, P, "Raptors"],
    ["Lucy Beckham High School", "charleston", "Mount Pleasant", "29466", 32.8870, -79.7710, P, "Bengals"],
    ["James Island Charter High School", "charleston", "Charleston", "29412", 32.7210, -79.9550, P, "Trojans"],
    ["Summerville High School", "charleston", "Summerville", "29483", 33.0080, -80.1880, P, "Green Wave"],
    ["Fort Dorchester High School", "charleston", "North Charleston", "29420", 32.9230, -80.1180, P, "Patriots"],
    ["Dutch Fork High School", "columbia", "Irmo", "29063", 34.1140, -81.2160, P, "Silver Foxes"],
    ["Chapin High School", "columbia", "Chapin", "29036", 34.1660, -81.3500, P, "Eagles"],
    ["Lexington High School", "columbia", "Lexington", "29072", 33.9810, -81.2360, P, "Wildcats"],
    ["River Bluff High School", "columbia", "Lexington", "29073", 33.9920, -81.1690, P, "Gators"],
    ["Spring Valley High School", "columbia", "Columbia", "29229", 34.1180, -80.9050, P, "Vikings"],
    ["Blythewood High School", "columbia", "Blythewood", "29016", 34.2040, -80.9640, P, "Bengals"],
    ["Dreher High School", "columbia", "Columbia", "29205", 33.9920, -81.0060, P, "Blue Devils"],
    ["J.L. Mann High School", "greenville-upstate", "Greenville", "29607", 34.8040, -82.3340, P, "Patriots"],
    ["Riverside High School", "greenville-upstate", "Greer", "29651", 34.8980, -82.2650, P, "Warriors"],
    ["Wade Hampton High School", "greenville-upstate", "Greenville", "29609", 34.8740, -82.3480, P, "Generals"],
    ["Greenville Senior High School", "greenville-upstate", "Greenville", "29601", 34.8370, -82.4050, P, "Red Raiders"],
    ["Dorman High School", "greenville-upstate", "Roebuck", "29376", 34.8790, -82.0010, P, "Cavaliers"],
    ["T.L. Hanna High School", "greenville-upstate", "Anderson", "29621", 34.5340, -82.6290, P, "Yellow Jackets"],
  ]),

  // ---------------------------- Tennessee (TSSAA) ----------------------------
  ...state("TN", [
    ["Brentwood Academy", "nashville", "Brentwood", "37027", 35.9930, -86.7850, PV, "Eagles"],
    ["Ensworth School", "nashville", "Nashville", "37205", 36.0920, -86.8920, PV, "Tigers"],
    ["Montgomery Bell Academy", "nashville", "Nashville", "37205", 36.1340, -86.8320, PV, "Big Red", BOYS],
    ["Father Ryan High School", "nashville", "Nashville", "37220", 36.0710, -86.7690, PV, "Irish"],
    ["Brentwood High School", "nashville", "Brentwood", "37027", 36.0210, -86.8030, P, "Bruins"],
    ["Ravenwood High School", "nashville", "Brentwood", "37027", 35.9790, -86.7480, P, "Raptors"],
    ["Franklin High School", "nashville", "Franklin", "37064", 35.9240, -86.8790, P, "Admirals"],
    ["Memphis University School", "memphis", "Memphis", "38119", 35.0870, -89.8540, PV, "Owls", BOYS],
    ["Christian Brothers High School", "memphis", "Memphis", "38120", 35.1100, -89.8520, PV, "Purple Wave", BOYS],
    ["St. Benedict at Auburndale", "memphis", "Cordova", "38016", 35.1660, -89.7690, PV, "Eagles"],
    ["Houston High School", "memphis", "Germantown", "38138", 35.0730, -89.7910, P, "Mustangs"],
    ["Collierville High School", "memphis", "Collierville", "38017", 35.0420, -89.6650, P, "Dragons"],
    ["Farragut High School", "knoxville", "Knoxville", "37934", 35.8770, -84.1700, P, "Admirals"],
    ["Bearden High School", "knoxville", "Knoxville", "37919", 35.9280, -84.0170, P, "Bulldogs"],
    ["Webb School of Knoxville", "knoxville", "Knoxville", "37923", 35.9220, -84.0780, PV, "Spartans"],
    ["Knoxville Catholic High School", "knoxville", "Knoxville", "37932", 35.9110, -84.1150, PV, "Fighting Irish"],
    ["Maryville High School", "knoxville", "Maryville", "37804", 35.7470, -83.9640, P, "Rebels"],
    ["McCallie School", "chattanooga", "Chattanooga", "37404", 35.0280, -85.2710, PV, "Blue Tornado", BOYS],
    ["Baylor School", "chattanooga", "Chattanooga", "37405", 35.0800, -85.3480, PV, "Red Raiders"],
    ["Girls Preparatory School", "chattanooga", "Chattanooga", "37405", 35.0670, -85.3060, PV, "Bruisers", GIRLS],
  ]),

  // ---------------------------- California (CIF) ----------------------------
  ...state("CA", [
    ["Mater Dei High School", "la-socal", "Santa Ana", "92707", 33.7270, -117.8690, PV, "Monarchs"],
    ["JSerra Catholic High School", "la-socal", "San Juan Capistrano", "92675", 33.5200, -117.6680, PV, "Lions"],
    ["Santa Margarita Catholic High School", "la-socal", "Rancho Santa Margarita", "92688", 33.6400, -117.6000, PV, "Eagles"],
    ["Loyola High School of Los Angeles", "la-socal", "Los Angeles", "90006", 34.0480, -118.2930, PV, "Cubs", BOYS],
    ["Harvard-Westlake School", "la-socal", "Studio City", "91604", 34.1400, -118.4130, PV, "Wolverines"],
    ["Corona del Mar High School", "la-socal", "Newport Beach", "92625", 33.6080, -117.8640, P, "Sea Kings"],
    ["Mira Costa High School", "la-socal", "Manhattan Beach", "90266", 33.8810, -118.3970, P, "Mustangs"],
    ["De La Salle High School", "bay-area-norcal", "Concord", "94518", 37.9530, -122.0300, PV, "Spartans", BOYS],
    ["St. Francis High School", "bay-area-norcal", "Mountain View", "94040", 37.3800, -122.0870, PV, "Lancers"],
    ["Bellarmine College Preparatory", "bay-area-norcal", "San Jose", "95126", 37.3410, -121.9180, PV, "Bells", BOYS],
    ["Archbishop Mitty High School", "bay-area-norcal", "San Jose", "95129", 37.3060, -121.9780, PV, "Monarchs"],
    ["Torrey Pines High School", "san-diego", "San Diego", "92130", 32.9580, -117.2310, P, "Falcons"],
    ["Cathedral Catholic High School", "san-diego", "San Diego", "92130", 32.9480, -117.2170, PV, "Dons"],
    ["La Costa Canyon High School", "san-diego", "Carlsbad", "92009", 33.0820, -117.2380, P, "Mavericks"],
    ["Carlsbad High School", "san-diego", "Carlsbad", "92008", 33.1720, -117.3290, P, "Lancers"],
    ["Jesuit High School Sacramento", "sacramento", "Carmichael", "95608", 38.6360, -121.3260, PV, "Marauders", BOYS],
    ["St. Francis Catholic High School", "sacramento", "Sacramento", "95819", 38.5600, -121.4470, PV, "Troubadours", GIRLS],
    ["Granite Bay High School", "sacramento", "Granite Bay", "95746", 38.7560, -121.1760, P, "Grizzlies"],
    ["Clovis West High School", "central-valley", "Fresno", "93720", 36.8640, -119.7330, P, "Golden Eagles"],
    ["Buchanan High School", "central-valley", "Clovis", "93619", 36.8640, -119.6700, P, "Bears"],
  ]),

  // ---------------------------- New York (NYSPHSAA) ----------------------------
  ...state("NY", [
    ["Scarsdale High School", "nyc-metro", "Scarsdale", "10583", 40.9890, -73.8000, P, "Raiders"],
    ["Rye High School", "nyc-metro", "Rye", "10580", 40.9800, -73.6850, P, "Garnets"],
    ["Horace Greeley High School", "nyc-metro", "Chappaqua", "10514", 41.1600, -73.7650, P, "Quakers"],
    ["Mamaroneck High School", "nyc-metro", "Mamaroneck", "10543", 40.9530, -73.7340, P, "Tigers"],
    ["Byram Hills High School", "nyc-metro", "Armonk", "10504", 41.1270, -73.7010, P, "Bobcats"],
    ["Garden City High School", "long-island", "Garden City", "11530", 40.7270, -73.6390, P, "Trojans"],
    ["Ward Melville High School", "long-island", "East Setauket", "11733", 40.9290, -73.1080, P, "Patriots"],
    ["Northport High School", "long-island", "Northport", "11768", 40.8870, -73.3270, P, "Tigers"],
    ["Smithtown High School West", "long-island", "Smithtown", "11787", 40.8530, -73.2210, P, "Bulls"],
    ["Half Hollow Hills High School East", "long-island", "Dix Hills", "11746", 40.8120, -73.3570, P, "Thunderbirds"],
    ["Sachem High School North", "long-island", "Lake Ronkonkoma", "11779", 40.8270, -73.1050, P, "Flaming Arrows"],
    ["Clarkstown South High School", "hudson-valley", "West Nyack", "10994", 41.0960, -73.9730, P, "Vikings"],
    ["Suffern High School", "hudson-valley", "Suffern", "10901", 41.1150, -74.1440, P, "Mounties"],
    ["Pearl River High School", "hudson-valley", "Pearl River", "10965", 41.0590, -74.0220, P, "Pirates"],
    ["Arlington High School", "hudson-valley", "LaGrangeville", "12540", 41.6570, -73.7880, P, "Admirals"],
    ["Shenendehowa High School", "upstate-ny", "Clifton Park", "12065", 42.8650, -73.7710, P, "Plainsmen"],
    ["Bethlehem Central High School", "upstate-ny", "Delmar", "12054", 42.6220, -73.8320, P, "Eagles"],
    ["Fayetteville-Manlius High School", "upstate-ny", "Manlius", "13104", 43.0020, -75.9770, P, "Hornets"],
    ["Pittsford Sutherland High School", "upstate-ny", "Pittsford", "14534", 43.0900, -77.5150, P, "Knights"],
    ["Williamsville East High School", "upstate-ny", "East Amherst", "14051", 43.0180, -78.6970, P, "Flames"],
  ]),

  // ---------------------------- New Jersey (NJSIAA) ----------------------------
  ...state("NJ", [
    ["Delbarton School", "north-nj", "Morristown", "07960", 40.7870, -74.5110, PV, "Green Wave", BOYS],
    ["Bergen Catholic High School", "north-nj", "Oradell", "07649", 40.9560, -74.0370, PV, "Crusaders", BOYS],
    ["Ridgewood High School", "north-nj", "Ridgewood", "07450", 40.9810, -74.1160, P, "Maroons"],
    ["Kearny High School", "north-nj", "Kearny", "07032", 40.7680, -74.1450, P, "Kardinals"],
    ["Montclair High School", "north-nj", "Montclair", "07042", 40.8180, -74.2140, P, "Mounties"],
    ["Ramapo High School", "north-nj", "Franklin Lakes", "07417", 41.0170, -74.2060, P, "Raiders"],
    ["Morristown High School", "north-nj", "Morristown", "07960", 40.7980, -74.4780, P, "Colonials"],
    ["West Morris Mendham High School", "north-nj", "Mendham", "07945", 40.7760, -74.6010, P, "Minutemen"],
    ["Christian Brothers Academy", "central-nj", "Lincroft", "07738", 40.3360, -74.1220, PV, "Colts", BOYS],
    ["Red Bank Catholic High School", "central-nj", "Red Bank", "07701", 40.3470, -74.0650, PV, "Caseys"],
    ["Holmdel High School", "central-nj", "Holmdel", "07733", 40.3800, -74.1710, P, "Hornets"],
    ["Princeton High School", "central-nj", "Princeton", "08540", 40.3570, -74.6670, P, "Tigers"],
    ["Hunterdon Central Regional High School", "central-nj", "Flemington", "08822", 40.5120, -74.8590, P, "Red Devils"],
    ["Ridge High School", "central-nj", "Basking Ridge", "07920", 40.7060, -74.5490, P, "Red Devils"],
    ["Watchung Hills Regional High School", "central-nj", "Warren", "07059", 40.6340, -74.5000, P, "Warriors"],
    ["Eastern Regional High School", "south-nj", "Voorhees", "08043", 39.8520, -74.9600, P, "Vikings"],
    ["Cherry Hill High School East", "south-nj", "Cherry Hill", "08003", 39.9060, -74.9800, P, "Cougars"],
    ["Shawnee High School", "south-nj", "Medford", "08055", 39.9010, -74.8240, P, "Renegades"],
    ["Haddonfield Memorial High School", "south-nj", "Haddonfield", "08033", 39.8920, -75.0380, P, "Bulldawgs"],
    ["Ocean City High School", "south-nj", "Ocean City", "08226", 39.2780, -74.5750, P, "Red Raiders"],
  ]),

  // ---------------------------- Virginia (VHSL) ----------------------------
  ...state("VA", [
    ["W.T. Woodson High School", "northern-va-dc-metro", "Fairfax", "22032", 38.8240, -77.2650, P, "Cavaliers"],
    ["James Madison High School", "northern-va-dc-metro", "Vienna", "22181", 38.9030, -77.2810, P, "Warhawks"],
    ["Langley High School", "northern-va-dc-metro", "McLean", "22101", 38.9560, -77.1890, P, "Saxons"],
    ["McLean High School", "northern-va-dc-metro", "McLean", "22101", 38.9240, -77.1960, P, "Highlanders"],
    ["Oakton High School", "northern-va-dc-metro", "Vienna", "22124", 38.8840, -77.3050, P, "Cougars"],
    ["Yorktown High School", "northern-va-dc-metro", "Arlington", "22207", 38.8970, -77.1340, P, "Patriots"],
    ["Washington-Liberty High School", "northern-va-dc-metro", "Arlington", "22201", 38.8880, -77.0970, P, "Generals"],
    ["Stone Bridge High School", "northern-va-dc-metro", "Ashburn", "20147", 39.0270, -77.4730, P, "Bulldogs"],
    ["Douglas S. Freeman High School", "richmond", "Henrico", "23229", 37.5990, -77.5410, P, "Mavericks"],
    ["Deep Run High School", "richmond", "Glen Allen", "23059", 37.6680, -77.5950, P, "Wildcats"],
    ["Mills E. Godwin High School", "richmond", "Henrico", "23238", 37.6230, -77.6140, P, "Eagles"],
    ["Cosby High School", "richmond", "Midlothian", "23112", 37.4290, -77.6470, P, "Titans"],
    ["Midlothian High School", "richmond", "Midlothian", "23113", 37.5160, -77.6550, P, "Trojans"],
    ["Kellam High School", "hampton-roads", "Virginia Beach", "23456", 36.7660, -76.0560, P, "Knights"],
    ["First Colonial High School", "hampton-roads", "Virginia Beach", "23454", 36.8640, -76.0270, P, "Patriots"],
    ["Grassfield High School", "hampton-roads", "Chesapeake", "23322", 36.7110, -76.2230, P, "Grizzlies"],
    ["Hickory High School", "hampton-roads", "Chesapeake", "23322", 36.6640, -76.2830, P, "Hawks"],
    ["Harrisonburg High School", "shenandoah-valley", "Harrisonburg", "22801", 38.4300, -78.8850, P, "Blue Streaks"],
    ["Turner Ashby High School", "shenandoah-valley", "Bridgewater", "22812", 38.3990, -78.9750, P, "Knights"],
    ["John Handley High School", "shenandoah-valley", "Winchester", "22601", 39.1720, -78.1730, P, "Judges"],
  ]),

  // ---------------------------- Illinois (IHSA) ----------------------------
  ...state("IL", [
    ["Naperville North High School", "chicagoland", "Naperville", "60563", 41.7900, -88.1610, P, "Huskies"],
    ["Naperville Central High School", "chicagoland", "Naperville", "60540", 41.7710, -88.1530, P, "Redhawks"],
    ["Loyola Academy", "chicagoland", "Wilmette", "60091", 42.0730, -87.7400, PV, "Ramblers"],
    ["Saint Ignatius College Prep", "chicagoland", "Chicago", "60608", 41.8690, -87.6730, PV, "Wolfpack"],
    ["New Trier High School", "chicagoland", "Winnetka", "60093", 42.1020, -87.7350, P, "Trevians"],
    ["Adlai E. Stevenson High School", "chicagoland", "Lincolnshire", "60069", 42.1940, -87.9310, P, "Patriots"],
    ["Hinsdale Central High School", "chicagoland", "Hinsdale", "60521", 41.8020, -87.9370, P, "Red Devils"],
    ["Lyons Township High School", "chicagoland", "La Grange", "60525", 41.8070, -87.8700, P, "Lions"],
    ["Barrington High School", "chicagoland", "Barrington", "60010", 42.1500, -88.1260, P, "Broncos"],
    ["St. Charles North High School", "chicagoland", "St. Charles", "60175", 41.9420, -88.2860, P, "North Stars"],
    ["Benet Academy", "chicagoland", "Lisle", "60532", 41.8020, -88.0880, PV, "Redwings"],
    ["York Community High School", "chicagoland", "Elmhurst", "60126", 41.8920, -87.9500, P, "Dukes"],
    ["Normal Community High School", "central-il", "Normal", "61761", 40.5300, -88.9830, P, "Ironmen"],
    ["Sacred Heart-Griffin High School", "central-il", "Springfield", "62702", 39.8170, -89.6510, PV, "Cyclones"],
    ["Peoria Notre Dame High School", "central-il", "Peoria", "61604", 40.7210, -89.6180, PV, "Irish"],
    ["Centennial High School", "central-il", "Champaign", "61821", 40.1170, -88.2830, P, "Chargers"],
    ["Edwardsville High School", "southern-il", "Edwardsville", "62025", 38.7940, -89.9530, P, "Tigers"],
    ["O'Fallon Township High School", "southern-il", "O'Fallon", "62269", 38.5920, -89.9110, P, "Panthers"],
    ["Belleville East High School", "southern-il", "Belleville", "62221", 38.5250, -89.9330, P, "Lancers"],
    ["Carbondale Community High School", "southern-il", "Carbondale", "62901", 37.7270, -89.2170, P, "Terriers"],
  ]),
];
