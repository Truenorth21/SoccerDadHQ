/* ------------------------------------------------------------------ *
 *  National expansion seed: 30 clubs each in Texas, Georgia, North
 *  Carolina, South Carolina, Tennessee, California, New York, New Jersey,
 *  Virginia, Illinois, Pennsylvania, Ohio, Maryland, Washington, Colorado,
 *  Arizona and Massachusetts, plus 6–10 each in the remaining 32 states
 *  (listed by city / ZIP, no regions). New states are appended at the end so
 *  existing club and coach ids stay stable. Like the Florida seed, these
 *  are unclaimed, unrated directory entries with no contact details —
 *  programs fill those in when they claim the profile. Coordinates are
 *  city-level (good enough for the ZIP radius filter and "nearby" clubs).
 *  Founding years and websites are left blank on purpose rather than guessed.
 * ------------------------------------------------------------------ */

export interface NationalRawClub {
  name: string;
  state: string; // two-letter code
  region: string; // full region key, e.g. "tx-dfw"; "" for states without regions
  city: string;
  zip: string;
  lat: number;
  lng: number;
  topLeagues: string[];
}

type Row = [name: string, regionSlug: string, city: string, zip: string, lat: number, lng: number, leagues: string[]];

const ECNL = "ECNL";
const ECRL = "ECNL Regional League";
const MLSN = "MLS NEXT";
const GA = "Girls Academy (GA)";
const NPL = "National Premier Leagues (NPL)";
const NL = "USYS National League";
const DPL = "Development Player League (DPL)";

function state(code: string, rows: Row[]): NationalRawClub[] {
  const prefix = code.toLowerCase();
  return rows.map(([name, regionSlug, city, zip, lat, lng, topLeagues]) => ({
    name,
    state: code,
    region: `${prefix}-${regionSlug}`,
    city,
    zip,
    lat,
    lng,
    topLeagues,
  }));
}

type CityRow = [name: string, city: string, zip: string, lat: number, lng: number, leagues: string[]];

/** For states without predefined regions: region is left empty (stored as null). */
function cities(code: string, rows: CityRow[]): NationalRawClub[] {
  return rows.map(([name, city, zip, lat, lng, topLeagues]) => ({ name, state: code, region: "", city, zip, lat, lng, topLeagues }));
}

export const NATIONAL_RAW_CLUBS: NationalRawClub[] = [
  // ---------------------------- Texas ----------------------------
  ...state("TX", [
    ["Solar Soccer Club", "dfw", "Dallas", "75243", 32.9126, -96.7377, [ECNL, MLSN]],
    ["FC Dallas Youth", "dfw", "Frisco", "75034", 33.1543, -96.8353, [MLSN, ECNL]],
    ["Dallas Texans Soccer Club", "dfw", "Dallas", "75230", 32.8998, -96.7897, [ECNL, MLSN]],
    ["Sting Soccer Club", "dfw", "Dallas", "75248", 32.9687, -96.7963, [ECNL, ECRL]],
    ["Andromeda FC", "dfw", "Dallas", "75201", 32.7876, -96.7994, [GA, NPL]],
    ["Fort Worth United SC", "dfw", "Fort Worth", "76132", 32.6713, -97.4053, [ECRL, NL]],
    ["Arlington Rush SC", "dfw", "Arlington", "76016", 32.6890, -97.1842, [ECRL, NPL]],
    ["Plano Premier SC", "dfw", "Plano", "75093", 33.0301, -96.8107, [ECRL, NL]],
    ["Frisco United FC", "dfw", "Frisco", "75035", 33.1507, -96.7712, [NPL, DPL]],
    ["Denton County SC", "dfw", "Denton", "76201", 33.2148, -97.1331, [NL]],
    ["Texans SC Houston", "houston", "Houston", "77079", 29.7752, -95.5980, [ECNL, MLSN]],
    ["Houston Dynamo FC Academy", "houston", "Houston", "77002", 29.7522, -95.3557, [MLSN]],
    ["Albion Hurricanes FC", "houston", "Houston", "77084", 29.8269, -95.6619, [ECNL, NPL]],
    ["Challenge Soccer Club", "houston", "Spring", "77379", 30.0302, -95.5305, [ECNL, GA]],
    ["Katy Youth SC", "houston", "Katy", "77494", 29.7419, -95.8231, [ECRL, NL]],
    ["Sugar Land United FC", "houston", "Sugar Land", "77479", 29.5713, -95.6350, [ECRL, DPL]],
    ["The Woodlands Soccer Club", "houston", "The Woodlands", "77381", 30.1744, -95.5013, [ECRL, NPL]],
    ["Pearland United SC", "houston", "Pearland", "77584", 29.5458, -95.3225, [NL]],
    ["Lonestar SC", "austin-san-antonio", "Austin", "78759", 30.4049, -97.7519, [ECNL, MLSN]],
    ["Austin FC Academy", "austin-san-antonio", "Austin", "78758", 30.3880, -97.7197, [MLSN]],
    ["Capital Area FC", "austin-san-antonio", "Austin", "78745", 30.2069, -97.7956, [ECRL, NPL]],
    ["Round Rock United SC", "austin-san-antonio", "Round Rock", "78664", 30.5083, -97.6789, [ECRL, NL]],
    ["Hill Country FC", "austin-san-antonio", "San Marcos", "78666", 29.8833, -97.9414, [NL]],
    ["Classics Elite Soccer Academy", "san-antonio", "San Antonio", "78216", 29.5333, -98.4889, [ECNL, GA]],
    ["Alamo City SC", "san-antonio", "San Antonio", "78230", 29.5408, -98.5560, [ECRL, NPL]],
    ["San Antonio Premier FC", "san-antonio", "San Antonio", "78249", 29.5613, -98.6150, [NPL, DPL]],
    ["New Braunfels United", "san-antonio", "New Braunfels", "78130", 29.7030, -98.1245, [NL]],
    ["Sun City FC", "west-texas", "El Paso", "79912", 31.8384, -106.5300, [ECRL, NL]],
    ["Lubbock United SC", "west-texas", "Lubbock", "79424", 33.5179, -101.8780, [NL]],
    ["Permian Basin SC", "west-texas", "Midland", "79707", 32.0204, -102.1522, [NL]],
  ]),

  // ---------------------------- Georgia ----------------------------
  ...state("GA", [
    ["Concorde Fire SC", "atlanta-metro", "Atlanta", "30342", 33.8840, -84.3790, [ECNL, MLSN]],
    ["Atlanta United Academy", "atlanta-metro", "Marietta", "30066", 33.9940, -84.4800, [MLSN]],
    ["Tophat SC", "atlanta-metro", "Atlanta", "30319", 33.8710, -84.3350, [ECNL, GA]],
    ["Gwinnett Soccer Association", "atlanta-metro", "Lawrenceville", "30043", 33.9990, -84.0040, [ECRL, NPL]],
    ["Atlanta Fire United", "atlanta-metro", "Duluth", "30096", 33.9990, -84.1450, [ECRL, MLSN]],
    ["United Futbol Academy", "atlanta-metro", "Cumming", "30041", 34.2020, -84.1310, [ECNL, NPL]],
    ["Southern Soccer Academy", "atlanta-metro", "Marietta", "30062", 34.0010, -84.4660, [ECNL, ECRL]],
    ["Inter Atlanta FC", "atlanta-metro", "Atlanta", "30329", 33.8230, -84.3270, [NPL, DPL]],
    ["North Atlanta SC", "atlanta-metro", "Alpharetta", "30022", 34.0290, -84.2430, [ECRL, NL]],
    ["Peachtree City Lazers", "atlanta-metro", "Peachtree City", "30269", 33.3970, -84.5730, [ECRL, GA]],
    ["Cobb FC", "atlanta-metro", "Kennesaw", "30144", 34.0230, -84.6150, [NPL, NL]],
    ["DeKalb United SC", "atlanta-metro", "Decatur", "30030", 33.7710, -84.2960, [NL]],
    ["East Cobb United", "atlanta-metro", "Marietta", "30068", 33.9700, -84.4380, [ECRL, NPL]],
    ["Conyers United SC", "atlanta-metro", "Conyers", "30013", 33.6680, -84.0170, [NL]],
    ["South Atlanta FC", "atlanta-metro", "Fayetteville", "30214", 33.4490, -84.4550, [NPL, DPL]],
    ["Lanier Soccer Association", "north-georgia", "Gainesville", "30501", 34.2980, -83.8240, [ECRL, NL]],
    ["Dalton United FC", "north-georgia", "Dalton", "30720", 34.7700, -84.9700, [NL]],
    ["Rome United SC", "north-georgia", "Rome", "30161", 34.2570, -85.1650, [NL]],
    ["Athens United SC", "north-georgia", "Athens", "30606", 33.9460, -83.4300, [ECRL, NPL]],
    ["Cartersville FC", "north-georgia", "Cartersville", "30120", 34.1650, -84.8000, [NL]],
    ["Blue Ridge Mountain SC", "north-georgia", "Ellijay", "30540", 34.6950, -84.4820, [NL]],
    ["Savannah United SC", "savannah-coastal", "Savannah", "31406", 31.9860, -81.0810, [ECRL, NPL]],
    ["Coastal Georgia FC", "savannah-coastal", "Brunswick", "31525", 31.2310, -81.4820, [NL]],
    ["Richmond Hill SC", "savannah-coastal", "Richmond Hill", "31324", 31.9380, -81.3030, [NL]],
    ["Pooler FC", "savannah-coastal", "Pooler", "31322", 32.1150, -81.2470, [NPL]],
    ["Golden Isles SC", "savannah-coastal", "St. Simons Island", "31522", 31.1500, -81.3890, [NL]],
    ["Middle Georgia United", "middle-georgia", "Macon", "31210", 32.8900, -83.7300, [ECRL, NL]],
    ["Warner Robins SC", "middle-georgia", "Warner Robins", "31088", 32.5900, -83.6500, [NL]],
    ["Columbus United FC", "middle-georgia", "Columbus", "31909", 32.5300, -84.9300, [NPL, NL]],
    ["Perry United SC", "middle-georgia", "Perry", "31069", 32.4600, -83.7300, [NL]],
  ]),

  // ---------------------------- North Carolina ----------------------------
  ...state("NC", [
    ["Charlotte Soccer Academy", "charlotte", "Charlotte", "28277", 35.0530, -80.8140, [ECNL, MLSN]],
    ["Charlotte Independence Soccer Club", "charlotte", "Charlotte", "28210", 35.1310, -80.8530, [ECNL, ECRL]],
    ["Charlotte FC Academy", "charlotte", "Charlotte", "28217", 35.1710, -80.9090, [MLSN]],
    ["Lake Norman SC", "charlotte", "Cornelius", "28031", 35.4830, -80.8600, [ECRL, NPL]],
    ["Union Carolina FC", "charlotte", "Matthews", "28105", 35.1170, -80.7120, [NPL, NL]],
    ["Gaston United SC", "charlotte", "Gastonia", "28054", 35.2620, -81.1470, [NL]],
    ["Concord Cabarrus SC", "charlotte", "Concord", "28027", 35.4090, -80.5800, [ECRL, NL]],
    ["Mooresville United FC", "charlotte", "Mooresville", "28117", 35.5850, -80.8100, [NL]],
    ["Huntersville FC", "charlotte", "Huntersville", "28078", 35.4110, -80.8430, [NPL, DPL]],
    ["Ballantyne United SC", "charlotte", "Charlotte", "28277", 35.0510, -80.8490, [ECRL, GA]],
    ["North Carolina FC Youth", "triangle", "Cary", "27513", 35.7990, -78.8040, [ECNL, MLSN]],
    ["Capital Area Soccer League", "triangle", "Raleigh", "27612", 35.8540, -78.7040, [ECNL, GA]],
    ["Triangle United SC", "triangle", "Durham", "27707", 35.9590, -78.9600, [ECRL, NPL]],
    ["Wake FC", "triangle", "Holly Springs", "27540", 35.6510, -78.8340, [ECRL, MLSN]],
    ["Apex United FC", "triangle", "Apex", "27502", 35.7330, -78.8500, [NPL, NL]],
    ["Chapel Hill SC", "triangle", "Chapel Hill", "27514", 35.9130, -79.0560, [ECRL, NL]],
    ["Wake Forest United", "triangle", "Wake Forest", "27587", 35.9800, -78.5100, [NL]],
    ["Johnston County SC", "triangle", "Clayton", "27520", 35.6510, -78.4560, [NL]],
    ["Raleigh Elite FC", "triangle", "Raleigh", "27606", 35.7640, -78.7130, [NPL, DPL]],
    ["Fuquay-Varina SC", "triangle", "Fuquay-Varina", "27526", 35.5840, -78.8000, [NL]],
    ["Triad Elite SC", "triad", "Greensboro", "27410", 36.1000, -79.8900, [ECRL, NPL]],
    ["Greensboro United SA", "triad", "Greensboro", "27407", 36.0300, -79.8500, [ECRL, GA]],
    ["Twin City FC", "triad", "Winston-Salem", "27104", 36.0900, -80.3000, [ECRL, NL]],
    ["High Point United SC", "triad", "High Point", "27265", 36.0000, -80.0000, [NL]],
    ["Burlington Alamance FC", "triad", "Burlington", "27215", 36.0800, -79.4400, [NL]],
    ["Kernersville FC", "triad", "Kernersville", "27284", 36.1200, -80.0700, [NPL]],
    ["Wilmington Hammerheads Youth FC", "wilmington", "Wilmington", "28405", 34.2600, -77.8700, [ECRL, NPL]],
    ["Cape Fear United SC", "wilmington", "Wilmington", "28409", 34.1600, -77.8700, [NL]],
    ["Leland FC", "wilmington", "Leland", "28451", 34.2500, -78.0400, [NL]],
    ["Topsail SC", "wilmington", "Hampstead", "28443", 34.3700, -77.7100, [NL]],
  ]),

  // ---------------------------- South Carolina ----------------------------
  ...state("SC", [
    ["Charleston Battery Youth", "charleston", "Charleston", "29492", 32.8640, -79.9050, [ECRL, MLSN]],
    ["Mount Pleasant SC", "charleston", "Mount Pleasant", "29464", 32.8200, -79.8600, [ECRL, NPL]],
    ["Summerville FC", "charleston", "Summerville", "29483", 33.0200, -80.1800, [NL]],
    ["Lowcountry United FC", "charleston", "Charleston", "29407", 32.8000, -80.0300, [ECRL, GA]],
    ["Daniel Island SC", "charleston", "Charleston", "29492", 32.8700, -79.9200, [NPL]],
    ["James Island Youth SC", "charleston", "Charleston", "29412", 32.7200, -79.9500, [NL]],
    ["Goose Creek United", "charleston", "Goose Creek", "29445", 32.9800, -80.0300, [NL]],
    ["Beaufort Coastal FC", "charleston", "Beaufort", "29902", 32.4300, -80.6700, [NL]],
    ["Hilton Head SC", "charleston", "Hilton Head Island", "29926", 32.2200, -80.7500, [NPL, NL]],
    ["Grand Strand FC", "charleston", "Myrtle Beach", "29577", 33.6900, -78.8900, [NL]],
    ["South Carolina United FC", "columbia", "Columbia", "29210", 34.0500, -81.1000, [ECNL, ECRL]],
    ["Lexington County SC", "columbia", "Lexington", "29072", 33.9800, -81.2400, [ECRL, NL]],
    ["Irmo United FC", "columbia", "Irmo", "29063", 34.1000, -81.1800, [NL]],
    ["Blythewood SC", "columbia", "Blythewood", "29016", 34.2100, -80.9700, [NL]],
    ["Columbia Futbol Club", "columbia", "Columbia", "29229", 34.1200, -80.8900, [NPL, DPL]],
    ["Midlands United SC", "columbia", "Columbia", "29209", 33.9600, -80.9500, [NPL]],
    ["Aiken United FC", "columbia", "Aiken", "29803", 33.5200, -81.7200, [NL]],
    ["Sumter United SC", "columbia", "Sumter", "29150", 33.9200, -80.3400, [NL]],
    ["Orangeburg FC", "columbia", "Orangeburg", "29115", 33.4900, -80.8600, [NL]],
    ["Chapin SC", "columbia", "Chapin", "29036", 34.1700, -81.3500, [NL]],
    ["Carolina Elite Soccer Academy", "greenville-upstate", "Greenville", "29615", 34.8600, -82.3000, [ECNL, MLSN]],
    ["Greenville FC Youth", "greenville-upstate", "Greenville", "29601", 34.8500, -82.4000, [ECRL, NPL]],
    ["Spartanburg FC", "greenville-upstate", "Spartanburg", "29301", 34.9400, -81.9800, [ECRL, NL]],
    ["Clemson United SC", "greenville-upstate", "Clemson", "29631", 34.6800, -82.8400, [NL]],
    ["Anderson United FC", "greenville-upstate", "Anderson", "29621", 34.5300, -82.6500, [NL]],
    ["Greer United", "greenville-upstate", "Greer", "29650", 34.9400, -82.2300, [NPL]],
    ["Simpsonville FC", "greenville-upstate", "Simpsonville", "29681", 34.7400, -82.2500, [NL]],
    ["Easley United FC", "greenville-upstate", "Easley", "29640", 34.8300, -82.6000, [NL]],
    ["Mauldin SC", "greenville-upstate", "Mauldin", "29662", 34.7800, -82.3000, [NL]],
    ["Upstate Futbol Academy", "greenville-upstate", "Greenville", "29607", 34.8300, -82.3400, [NPL, GA]],
  ]),

  // ---------------------------- Tennessee ----------------------------
  ...state("TN", [
    ["Nashville SC Academy", "nashville", "Nashville", "37203", 36.1500, -86.7900, [MLSN]],
    ["Tennessee United SC", "nashville", "Brentwood", "37027", 36.0300, -86.7800, [ECNL, ECRL]],
    ["Franklin FC", "nashville", "Franklin", "37067", 35.9300, -86.8200, [ECRL, GA]],
    ["Murfreesboro United SC", "nashville", "Murfreesboro", "37129", 35.8700, -86.4200, [ECRL, NL]],
    ["Hendersonville FC", "nashville", "Hendersonville", "37075", 36.3000, -86.6200, [NL]],
    ["Clarksville United SC", "nashville", "Clarksville", "37040", 36.5300, -87.3600, [NL]],
    ["Gallatin Youth SC", "nashville", "Gallatin", "37066", 36.3900, -86.4500, [NL]],
    ["Mt. Juliet SC", "nashville", "Mt. Juliet", "37122", 36.2000, -86.5200, [NPL]],
    ["Nashville United FC", "nashville", "Nashville", "37211", 36.0800, -86.7200, [NPL, DPL]],
    ["Spring Hill FC", "nashville", "Spring Hill", "37174", 35.7500, -86.9300, [NL]],
    ["Memphis United SC", "memphis", "Memphis", "38119", 35.0800, -89.8600, [ECRL, NPL]],
    ["Germantown Legends SC", "memphis", "Germantown", "38138", 35.0900, -89.8000, [ECNL, ECRL]],
    ["Collierville SC", "memphis", "Collierville", "38017", 35.0400, -89.6600, [NL]],
    ["Bartlett FC", "memphis", "Bartlett", "38134", 35.2000, -89.8400, [NL]],
    ["Lakeland United", "memphis", "Lakeland", "38002", 35.2600, -89.7400, [NL]],
    ["Mid-South Futbol Club", "memphis", "Memphis", "38120", 35.1200, -89.8600, [NPL, GA]],
    ["Jackson United SC", "memphis", "Jackson", "38305", 35.6600, -88.8300, [NL]],
    ["Knoxville United SC", "knoxville", "Knoxville", "37922", 35.8600, -84.0800, [ECRL, NPL]],
    ["Knox FC", "knoxville", "Knoxville", "37919", 35.9200, -84.0000, [ECRL, GA]],
    ["Smoky Mountain SC", "knoxville", "Maryville", "37801", 35.7600, -83.9700, [NL]],
    ["Oak Ridge United", "knoxville", "Oak Ridge", "37830", 36.0100, -84.2700, [NL]],
    ["Farragut FC", "knoxville", "Farragut", "37934", 35.8800, -84.1600, [NPL]],
    ["Tri-Cities United SC", "knoxville", "Johnson City", "37604", 36.3100, -82.3500, [NL]],
    ["Sevier County SC", "knoxville", "Sevierville", "37862", 35.8700, -83.5600, [NL]],
    ["Chattanooga FC Academy", "chattanooga", "Chattanooga", "37402", 35.0500, -85.3100, [ECRL, MLSN]],
    ["Chattanooga United SC", "chattanooga", "Chattanooga", "37421", 35.0300, -85.1600, [ECRL, NPL]],
    ["Signal Mountain FC", "chattanooga", "Signal Mountain", "37377", 35.1200, -85.3400, [NL]],
    ["Cleveland United SC", "chattanooga", "Cleveland", "37312", 35.1800, -84.8700, [NL]],
    ["Ooltewah SC", "chattanooga", "Ooltewah", "37363", 35.0700, -85.0600, [NL]],
    ["Hixson FC", "chattanooga", "Hixson", "37343", 35.1500, -85.2300, [NPL]],
  ]),
  // ---------------------------- California ----------------------------
  ...state("CA", [
    ["LA Galaxy Academy", "la-socal", "Carson", "90746", 33.8644, -118.2611, [MLSN]],
    ["LAFC Academy", "la-socal", "Los Angeles", "90037", 34.0126, -118.2845, [MLSN]],
    ["Real So Cal", "la-socal", "Woodland Hills", "91367", 34.1764, -118.6170, [ECNL, MLSN]],
    ["Slammers FC", "la-socal", "Newport Beach", "92660", 33.6340, -117.8740, [ECNL, MLSN]],
    ["Pateadores Soccer Club", "la-socal", "Costa Mesa", "92626", 33.6800, -117.9080, [ECNL, MLSN]],
    ["So Cal Blues SC", "la-socal", "Lake Forest", "92630", 33.6469, -117.6892, [ECNL, GA]],
    ["LA Surf Soccer Club", "la-socal", "Arcadia", "91006", 34.1397, -118.0353, [ECNL, MLSN]],
    ["Beach FC", "la-socal", "Long Beach", "90815", 33.7960, -118.1150, [ECNL, MLSN]],
    ["Legends FC", "la-socal", "Chino", "91710", 34.0122, -117.6889, [ECNL, MLSN]],
    ["Strikers FC", "la-socal", "Irvine", "92618", 33.6600, -117.7450, [ECNL, MLSN]],
    ["San Diego Surf SC", "san-diego", "Del Mar", "92014", 32.9595, -117.2653, [ECNL, MLSN]],
    ["Albion SC San Diego", "san-diego", "San Diego", "92123", 32.8100, -117.1400, [MLSN, ECNL]],
    ["Rebels Soccer Club", "san-diego", "Chula Vista", "91913", 32.6400, -116.9900, [ECRL, MLSN]],
    ["San Diego Force FC", "san-diego", "Poway", "92064", 32.9628, -117.0359, [ECRL, NPL]],
    ["Carlsbad Lightning SC", "san-diego", "Carlsbad", "92008", 33.1581, -117.3506, [ECRL, NL]],
    ["Escondido United SC", "san-diego", "Escondido", "92025", 33.1192, -117.0864, [NL]],
    ["De Anza Force", "bay-area-norcal", "Cupertino", "95014", 37.3230, -122.0322, [ECNL, MLSN]],
    ["San Jose Earthquakes Academy", "bay-area-norcal", "San Jose", "95110", 37.3500, -121.9250, [MLSN]],
    ["Mustang Soccer", "bay-area-norcal", "Danville", "94526", 37.8216, -121.9999, [ECNL, MLSN]],
    ["Pleasanton Rage SC", "bay-area-norcal", "Pleasanton", "94566", 37.6624, -121.8747, [ECNL, GA]],
    ["Marin FC", "bay-area-norcal", "San Rafael", "94901", 37.9735, -122.5311, [ECRL, NPL]],
    ["San Francisco Glens SC", "bay-area-norcal", "San Francisco", "94116", 37.7440, -122.4860, [ECRL, MLSN]],
    ["MVLA Soccer Club", "bay-area-norcal", "Mountain View", "94040", 37.3861, -122.0839, [ECNL, MLSN]],
    ["Santa Rosa United", "bay-area-norcal", "Santa Rosa", "95403", 38.4404, -122.7141, [ECRL, NL]],
    ["Sacramento Republic FC Academy", "sacramento", "Sacramento", "95811", 38.5816, -121.4944, [MLSN]],
    ["Placer United SC", "sacramento", "Roseville", "95661", 38.7521, -121.2880, [ECRL, NPL]],
    ["Davis Legacy SC", "sacramento", "Davis", "95616", 38.5449, -121.7405, [ECRL, NL]],
    ["Central Valley Fuego Youth", "central-valley", "Fresno", "93711", 36.8300, -119.8300, [NPL, NL]],
    ["Modesto United SC", "central-valley", "Modesto", "95355", 37.6700, -120.9500, [NL]],
    ["Bakersfield Alliance SC", "central-valley", "Bakersfield", "93311", 35.3000, -119.1000, [ECRL, NL]],
  ]),

  // ---------------------------- New York ----------------------------
  ...state("NY", [
    ["NYCFC Academy", "nyc-metro", "Bronx", "10451", 40.8296, -73.9262, [MLSN]],
    ["Manhattan SC", "nyc-metro", "New York", "10024", 40.7870, -73.9754, [ECRL, MLSN]],
    ["Metropolitan Oval Academy", "nyc-metro", "Maspeth", "11378", 40.7230, -73.9040, [MLSN, NPL]],
    ["BW Gottschee", "nyc-metro", "Ridgewood", "11385", 40.7000, -73.8900, [MLSN, NL]],
    ["FC Westchester Youth", "nyc-metro", "Elmsford", "10523", 41.0550, -73.8200, [MLSN, ECRL]],
    ["Downtown United SC", "nyc-metro", "New York", "10013", 40.7200, -74.0050, [ECRL, NPL]],
    ["Brooklyn Italians SC", "nyc-metro", "Brooklyn", "11228", 40.6170, -74.0130, [NPL, NL]],
    ["Asphalt Green SC", "nyc-metro", "New York", "10128", 40.7810, -73.9450, [NL]],
    ["Staten Island Youth SC", "nyc-metro", "Staten Island", "10314", 40.6000, -74.1500, [NL]],
    ["Queens United FC", "nyc-metro", "Flushing", "11354", 40.7680, -73.8270, [NPL]],
    ["Westchester Flames Youth", "nyc-metro", "White Plains", "10601", 41.0340, -73.7629, [ECRL, NPL]],
    ["Lower Westchester United", "nyc-metro", "New Rochelle", "10801", 40.9115, -73.7824, [NL]],
    ["Albertson SC", "long-island", "Albertson", "11507", 40.7710, -73.6430, [ECNL, MLSN]],
    ["Massapequa SC", "long-island", "Massapequa", "11758", 40.6800, -73.4740, [ECRL, NL]],
    ["Long Island Rough Riders Youth", "long-island", "Huntington", "11743", 40.8682, -73.4257, [ECNL, NPL]],
    ["Sachem United SC", "long-island", "Holbrook", "11741", 40.8123, -73.0787, [NL]],
    ["Hicksville SC", "long-island", "Hicksville", "11801", 40.7684, -73.5251, [NPL]],
    ["Smithtown Kickers", "long-island", "Smithtown", "11787", 40.8559, -73.2007, [ECRL, NL]],
    ["East Meadow SC", "long-island", "East Meadow", "11554", 40.7140, -73.5590, [ECRL, GA]],
    ["Long Island Elite FC", "long-island", "Garden City", "11530", 40.7268, -73.6343, [NPL, DPL]],
    ["Hudson Valley Hammers", "hudson-valley", "Newburgh", "12550", 41.5034, -74.0104, [NPL, NL]],
    ["Rockland United SC", "hudson-valley", "Nanuet", "10954", 41.0887, -74.0135, [ECRL, NL]],
    ["Dutchess United FC", "hudson-valley", "Poughkeepsie", "12603", 41.6820, -73.8900, [NL]],
    ["Orange County FC", "hudson-valley", "Middletown", "10940", 41.4459, -74.4229, [NL]],
    ["Rochester Lancers Youth", "upstate-ny", "Rochester", "14623", 43.0900, -77.6300, [ECRL, NPL]],
    ["Western New York Flash Academy", "upstate-ny", "Williamsville", "14221", 42.9600, -78.7400, [ECNL, GA]],
    ["Syracuse FC", "upstate-ny", "Syracuse", "13214", 43.0400, -76.0700, [ECRL, NL]],
    ["Capital District FC", "upstate-ny", "Albany", "12205", 42.7200, -73.8100, [ECRL, NPL]],
    ["Saratoga Youth SC", "upstate-ny", "Saratoga Springs", "12866", 43.0831, -73.7846, [NL]],
    ["Southern Tier FC", "upstate-ny", "Binghamton", "13905", 42.1000, -75.9500, [NL]],
  ]),

  // ---------------------------- New Jersey ----------------------------
  ...state("NJ", [
    ["New York Red Bulls Academy", "north-nj", "Whippany", "07981", 40.8240, -74.4170, [MLSN]],
    ["Match Fit Academy", "north-nj", "Flanders", "07836", 40.8450, -74.7000, [ECNL, MLSN]],
    ["Cedar Stars Academy Bergen", "north-nj", "Paramus", "07652", 40.9445, -74.0754, [MLSN, NPL]],
    ["Montclair United SC", "north-nj", "Montclair", "07042", 40.8259, -74.2090, [ECRL, NPL]],
    ["Passaic County FC", "north-nj", "Wayne", "07470", 40.9254, -74.2765, [NL]],
    ["Livingston SC", "north-nj", "Livingston", "07039", 40.7959, -74.3149, [ECRL, NL]],
    ["Morris United FC", "north-nj", "Morristown", "07960", 40.7968, -74.4815, [NPL, NL]],
    ["Ridgewood United SC", "north-nj", "Ridgewood", "07450", 40.9793, -74.1165, [NL]],
    ["Hoboken FC Youth", "north-nj", "Hoboken", "07030", 40.7440, -74.0324, [NPL]],
    ["Clifton United SC", "north-nj", "Clifton", "07013", 40.8700, -74.1640, [NL]],
    ["Sussex County FC", "north-nj", "Sparta", "07871", 41.0337, -74.6385, [NL]],
    ["Bergen Elite FC", "north-nj", "Hackensack", "07601", 40.8859, -74.0435, [ECRL, GA]],
    ["PDA (Players Development Academy)", "central-nj", "Somerset", "08873", 40.4980, -74.4885, [ECNL, MLSN]],
    ["Jersey Shore Boca", "central-nj", "Wall", "07719", 40.1640, -74.0910, [ECRL, MLSN]],
    ["Princeton FC", "central-nj", "Princeton", "08540", 40.3573, -74.6672, [ECRL, NPL]],
    ["Monmouth FC", "central-nj", "Middletown", "07748", 40.3960, -74.1150, [ECRL, NPL]],
    ["Edison FC", "central-nj", "Edison", "08817", 40.5187, -74.4121, [NPL, NL]],
    ["Freehold Township SC", "central-nj", "Freehold", "07728", 40.2600, -74.2740, [ECRL, GA]],
    ["Toms River FC", "central-nj", "Toms River", "08753", 39.9537, -74.1979, [NL]],
    ["East Brunswick SC", "central-nj", "East Brunswick", "08816", 40.4279, -74.4160, [NL]],
    ["Hillsborough United", "central-nj", "Hillsborough", "08844", 40.4980, -74.6730, [NL]],
    ["Lawrenceville FC", "central-nj", "Lawrenceville", "08648", 40.2970, -74.7290, [NPL]],
    ["South Jersey Elite FC", "south-nj", "Cherry Hill", "08003", 39.8810, -74.9700, [ECRL, NPL]],
    ["Cherry Hill FC", "south-nj", "Cherry Hill", "08034", 39.9070, -74.9990, [NL]],
    ["Burlington County FC", "south-nj", "Mount Laurel", "08054", 39.9340, -74.8910, [NPL, DPL]],
    ["Gloucester County United", "south-nj", "Mullica Hill", "08062", 39.7390, -75.2240, [NL]],
    ["Medford SC", "south-nj", "Medford", "08055", 39.9007, -74.8238, [NL]],
    ["Sewell United", "south-nj", "Sewell", "08080", 39.7660, -75.1440, [NL]],
    ["Atlantic City FC Youth", "south-nj", "Egg Harbor Township", "08234", 39.3800, -74.6000, [NL]],
    ["Cape May County SC", "south-nj", "Cape May Court House", "08210", 39.0826, -74.8238, [NL]],
  ]),

  // ---------------------------- Virginia ----------------------------
  ...state("VA", [
    ["Loudoun Soccer", "northern-va-dc-metro", "Leesburg", "20175", 39.1157, -77.5636, [ECNL, MLSN]],
    ["Virginia Development Academy", "northern-va-dc-metro", "Woodbridge", "22192", 38.6582, -77.2497, [ECNL, MLSN]],
    ["Arlington Soccer Association", "northern-va-dc-metro", "Arlington", "22204", 38.8600, -77.1000, [ECNL, MLSN]],
    ["Fairfax Brave", "northern-va-dc-metro", "Fairfax", "22030", 38.8462, -77.3064, [ECNL, NPL]],
    ["McLean Youth Soccer", "northern-va-dc-metro", "McLean", "22101", 38.9339, -77.1773, [ECNL, NPL]],
    ["Alexandria Soccer Association", "northern-va-dc-metro", "Alexandria", "22304", 38.8048, -77.0469, [ECRL, MLSN]],
    ["SYC Soccer", "northern-va-dc-metro", "Springfield", "22152", 38.7893, -77.1872, [ECRL, NPL]],
    ["Virginia Union FC", "northern-va-dc-metro", "Ashburn", "20147", 39.0438, -77.4874, [ECRL, NL]],
    ["Prince William SC", "northern-va-dc-metro", "Manassas", "20110", 38.7509, -77.4753, [NL]],
    ["Reston Soccer Association", "northern-va-dc-metro", "Reston", "20190", 38.9586, -77.3570, [NPL, NL]],
    ["Vienna Youth Soccer", "northern-va-dc-metro", "Vienna", "22180", 38.9012, -77.2653, [NL]],
    ["Burke Athletic Club", "northern-va-dc-metro", "Burke", "22015", 38.7935, -77.2717, [NL]],
    ["Fredericksburg FC", "northern-va-dc-metro", "Fredericksburg", "22401", 38.3032, -77.4605, [ECRL, NL]],
    ["Richmond United", "richmond", "Richmond", "23233", 37.6460, -77.6290, [ECNL, MLSN]],
    ["Chesterfield United FC", "richmond", "Midlothian", "23113", 37.5060, -77.6490, [ECRL, NPL]],
    ["Henrico FC", "richmond", "Glen Allen", "23059", 37.6660, -77.5060, [NPL, NL]],
    ["Hanover SC", "richmond", "Mechanicsville", "23111", 37.6088, -77.3733, [NL]],
    ["Charlottesville Albemarle SC", "richmond", "Charlottesville", "22901", 38.0293, -78.4767, [ECRL, NL]],
    ["Petersburg United FC", "richmond", "Petersburg", "23805", 37.2279, -77.4019, [NL]],
    ["Goochland SC", "richmond", "Goochland", "23063", 37.6843, -77.8850, [NL]],
    ["Beach FC Virginia", "hampton-roads", "Virginia Beach", "23456", 36.7500, -76.0500, [ECNL, MLSN]],
    ["Virginia Rush", "hampton-roads", "Virginia Beach", "23454", 36.8300, -76.0300, [ECNL, NPL]],
    ["Chesapeake United SC", "hampton-roads", "Chesapeake", "23320", 36.7682, -76.2875, [ECRL, NL]],
    ["Norfolk FC", "hampton-roads", "Norfolk", "23505", 36.9000, -76.2900, [NL]],
    ["Peninsula United", "hampton-roads", "Newport News", "23602", 37.1100, -76.5200, [ECRL, NPL]],
    ["Williamsburg Youth SC", "hampton-roads", "Williamsburg", "23188", 37.3300, -76.7600, [NL]],
    ["Shenandoah Valley United", "shenandoah-valley", "Harrisonburg", "22801", 38.4496, -78.8689, [NPL, NL]],
    ["Winchester FC", "shenandoah-valley", "Winchester", "22601", 39.1857, -78.1633, [NL]],
    ["Staunton United", "shenandoah-valley", "Staunton", "24401", 38.1496, -79.0717, [NL]],
    ["Blue Ridge United FC", "shenandoah-valley", "Waynesboro", "22980", 38.0685, -78.8895, [NL]],
  ]),

  // ---------------------------- Illinois ----------------------------
  ...state("IL", [
    ["Sockers FC", "chicagoland", "Palatine", "60067", 42.1103, -88.0342, [ECNL, MLSN]],
    ["Chicago Fire Academy", "chicagoland", "Chicago", "60608", 41.8500, -87.6700, [MLSN]],
    ["FC United Soccer Club", "chicagoland", "Glenview", "60025", 42.0698, -87.7878, [ECNL, MLSN]],
    ["Eclipse Select SC", "chicagoland", "Libertyville", "60048", 42.2830, -87.9531, [ECNL, GA]],
    ["Chicago Inter SC", "chicagoland", "Chicago", "60616", 41.8500, -87.6300, [MLSN, NPL]],
    ["Chicago Rush SC", "chicagoland", "Oak Brook", "60523", 41.8320, -87.9290, [ECRL, MLSN]],
    ["Chicago City SC", "chicagoland", "Chicago", "60618", 41.9460, -87.7040, [ECRL, NPL]],
    ["Naperville Elite FC", "chicagoland", "Naperville", "60540", 41.7508, -88.1535, [ECRL, NPL]],
    ["Campton United", "chicagoland", "St. Charles", "60175", 41.9142, -88.3087, [ECRL, NL]],
    ["Wheaton United SC", "chicagoland", "Wheaton", "60187", 41.8661, -88.1070, [NPL, NL]],
    ["Schaumburg United FC", "chicagoland", "Schaumburg", "60193", 42.0334, -88.0834, [NL]],
    ["Evanston FC", "chicagoland", "Evanston", "60201", 42.0451, -87.6877, [ECRL, NL]],
    ["Southwest Chicago FC", "chicagoland", "Orland Park", "60462", 41.6303, -87.8539, [NPL, NL]],
    ["Joliet United SC", "chicagoland", "Joliet", "60435", 41.5250, -88.0817, [NL]],
    ["Aurora FC Youth", "chicagoland", "Aurora", "60504", 41.7606, -88.3201, [NL]],
    ["Lake County United", "chicagoland", "Gurnee", "60031", 42.3703, -87.9020, [NPL]],
    ["Elgin FC", "chicagoland", "Elgin", "60123", 42.0354, -88.2826, [NL]],
    ["Oak Park United SC", "chicagoland", "Oak Park", "60302", 41.8850, -87.7845, [NPL, DPL]],
    ["Downers Grove FC", "chicagoland", "Downers Grove", "60515", 41.8089, -88.0112, [ECRL, GA]],
    ["Tinley Park United", "chicagoland", "Tinley Park", "60477", 41.5734, -87.7845, [NL]],
    ["Springfield United SC", "central-il", "Springfield", "62704", 39.7817, -89.6501, [ECRL, NL]],
    ["Peoria FC", "central-il", "Peoria", "61615", 40.7700, -89.6300, [ECRL, NPL]],
    ["BN United FC", "central-il", "Bloomington", "61704", 40.4842, -88.9937, [NL]],
    ["Champaign United FC", "central-il", "Champaign", "61820", 40.1164, -88.2434, [NPL, NL]],
    ["Decatur United SC", "central-il", "Decatur", "62526", 39.8403, -88.9548, [NL]],
    ["Danville SC", "central-il", "Danville", "61832", 40.1245, -87.6300, [NL]],
    ["Metro East FC", "southern-il", "Edwardsville", "62025", 38.8114, -89.9532, [ECRL, NPL]],
    ["St. Clair County United", "southern-il", "O'Fallon", "62269", 38.5923, -89.9112, [NL]],
    ["Carbondale United SC", "southern-il", "Carbondale", "62901", 37.7273, -89.2168, [NL]],
    ["Marion FC", "southern-il", "Marion", "62959", 37.7306, -88.9331, [NL]],
  ]),

  // ---------------------------- Pennsylvania ----------------------------
  ...state("PA", [
    ["Philadelphia Union Academy", "philadelphia", "Chester", "19013", 39.8496, -75.3557, [MLSN]],
    ["FC Delco", "philadelphia", "Downingtown", "19335", 40.0065, -75.7033, [MLSN, ECNL]],
    ["Penn Fusion Soccer Academy", "philadelphia", "West Chester", "19382", 39.9607, -75.6055, [ECNL, MLSN]],
    ["FC Bucks", "philadelphia", "Doylestown", "18901", 40.3101, -75.1299, [ECRL, NPL]],
    ["Continental FC", "philadelphia", "Ambler", "19002", 40.1546, -75.2216, [GA, NPL]],
    ["Philadelphia Ukrainian Nationals Youth", "philadelphia", "Horsham", "19044", 40.1784, -75.1285, [NPL]],
    ["Main Line United SC", "philadelphia", "Wayne", "19087", 40.0440, -75.3877, [ECRL, NL]],
    ["Montgomery County FC", "philadelphia", "Norristown", "19401", 40.1215, -75.3399, [NL]],
    ["Delaware Valley United", "philadelphia", "Media", "19063", 39.9168, -75.3877, [NPL, DPL]],
    ["Philadelphia City SC", "philadelphia", "Philadelphia", "19103", 39.9526, -75.1652, [NL]],
    ["Riverhounds Development Academy", "pittsburgh", "Pittsburgh", "15203", 40.4285, -79.9822, [MLSN, ECRL]],
    ["Beadling Soccer Club", "pittsburgh", "Bridgeville", "15017", 40.3562, -80.1101, [ECRL, NPL]],
    ["Century United FC", "pittsburgh", "Pittsburgh", "15237", 40.5490, -80.0150, [ECRL, NPL]],
    ["Pittsburgh Elite FC", "pittsburgh", "Wexford", "15090", 40.6262, -80.0556, [GA, NL]],
    ["South Hills United SC", "pittsburgh", "Bethel Park", "15102", 40.3276, -80.0395, [NL]],
    ["Monroeville United", "pittsburgh", "Monroeville", "15146", 40.4212, -79.7881, [NL]],
    ["Erie Premier SC", "pittsburgh", "Erie", "16509", 42.0634, -80.0500, [NL]],
    ["PA Classics", "central-pa", "Manheim", "17545", 40.1634, -76.3950, [ECNL, MLSN]],
    ["Hershey FC", "central-pa", "Hershey", "17033", 40.2859, -76.6502, [ECRL, NPL]],
    ["Keystone FC", "central-pa", "Mechanicsburg", "17050", 40.2143, -77.0086, [ECRL, NPL]],
    ["Lancaster United SC", "central-pa", "Lancaster", "17601", 40.0670, -76.3070, [NL]],
    ["York County FC", "central-pa", "York", "17402", 39.9626, -76.7277, [NPL, NL]],
    ["Centre County United", "central-pa", "State College", "16801", 40.7934, -77.8600, [NL]],
    ["Harrisburg City FC Youth", "central-pa", "Harrisburg", "17112", 40.3374, -76.7880, [NL]],
    ["Lehigh Valley United", "lehigh-valley-ne", "Allentown", "18104", 40.6084, -75.5340, [ECRL, NPL]],
    ["Bethlehem FC", "lehigh-valley-ne", "Bethlehem", "18017", 40.6510, -75.3800, [NL]],
    ["Reading United Academy", "lehigh-valley-ne", "Reading", "19610", 40.3412, -75.9805, [ECRL, NPL]],
    ["Northeast PA Fusion", "lehigh-valley-ne", "Scranton", "18505", 41.3870, -75.6650, [NL]],
    ["Wyoming Valley SC", "lehigh-valley-ne", "Wilkes-Barre", "18702", 41.2459, -75.8813, [NL]],
    ["Pocono United FC", "lehigh-valley-ne", "Stroudsburg", "18360", 40.9868, -75.1946, [NL]],
  ]),

  // ---------------------------- Ohio ----------------------------
  ...state("OH", [
    ["Columbus Crew Academy", "columbus", "Obetz", "43207", 39.8792, -82.9510, [MLSN]],
    ["Ohio Premier Soccer Club", "columbus", "Dublin", "43016", 40.0992, -83.1141, [ECNL, MLSN]],
    ["Columbus Force SC", "columbus", "Columbus", "43235", 40.1020, -83.0650, [ECRL, NPL]],
    ["Westerville United FC", "columbus", "Westerville", "43081", 40.1262, -82.9291, [ECRL, NL]],
    ["Worthington United", "columbus", "Worthington", "43085", 40.0931, -83.0180, [NL]],
    ["Delaware County FC", "columbus", "Lewis Center", "43035", 40.1984, -83.0102, [NPL, NL]],
    ["Hilliard Soccer Club", "columbus", "Hilliard", "43026", 40.0334, -83.1582, [NL]],
    ["Licking County United", "columbus", "Newark", "43055", 40.0581, -82.4013, [NL]],
    ["Internationals SC", "cleveland-ne", "Medina", "44256", 41.1384, -81.8637, [MLSN, GA]],
    ["Cleveland Force SC", "cleveland-ne", "Strongsville", "44136", 41.3145, -81.8357, [ECRL, NPL]],
    ["Ohio Galaxies FC", "cleveland-ne", "Akron", "44333", 41.1530, -81.6270, [ECRL, NPL]],
    ["Cleveland Futbol Academy", "cleveland-ne", "Cleveland", "44113", 41.4819, -81.6990, [NPL, DPL]],
    ["Lakeshore United SC", "cleveland-ne", "Mentor", "44060", 41.6662, -81.3396, [NL]],
    ["Westlake FC", "cleveland-ne", "Westlake", "44145", 41.4553, -81.9179, [NL]],
    ["Canton United SC", "cleveland-ne", "Canton", "44718", 40.8500, -81.4400, [NL]],
    ["Hudson United FC", "cleveland-ne", "Hudson", "44236", 41.2401, -81.4407, [ECRL, NL]],
    ["FC Cincinnati Academy", "cincinnati-dayton", "Milford", "45150", 39.1753, -84.2944, [MLSN]],
    ["Cincinnati United Premier", "cincinnati-dayton", "Cincinnati", "45242", 39.2440, -84.3550, [ECNL, MLSN]],
    ["Ohio Elite Soccer Academy", "cincinnati-dayton", "Cincinnati", "45241", 39.2700, -84.4100, [ECNL, MLSN]],
    ["Kings Hammer FC", "cincinnati-dayton", "Cincinnati", "45249", 39.2690, -84.3290, [GA, MLSN]],
    ["Cincinnati West SC", "cincinnati-dayton", "Cincinnati", "45248", 39.1620, -84.6300, [NL]],
    ["Mason United FC", "cincinnati-dayton", "Mason", "45040", 39.3601, -84.3099, [ECRL, NPL]],
    ["Dayton Dutch Lions Youth", "cincinnati-dayton", "West Carrollton", "45449", 39.6720, -84.2522, [NPL, DPL]],
    ["Miami Valley United", "cincinnati-dayton", "Centerville", "45459", 39.6284, -84.1594, [NL]],
    ["Springboro Soccer Club", "cincinnati-dayton", "Springboro", "45066", 39.5523, -84.2333, [NL]],
    ["Toledo Celtic SC", "toledo-nw", "Toledo", "43615", 41.6500, -83.6700, [ECRL, NPL]],
    ["Maumee Valley FC", "toledo-nw", "Maumee", "43537", 41.5628, -83.6538, [NL]],
    ["Perrysburg United", "toledo-nw", "Perrysburg", "43551", 41.5570, -83.6272, [NL]],
    ["Sylvania Youth SC", "toledo-nw", "Sylvania", "43560", 41.7189, -83.7130, [NL]],
    ["Findlay FC", "toledo-nw", "Findlay", "45840", 41.0442, -83.6499, [NL]],
  ]),

  // ---------------------------- Maryland ----------------------------
  ...state("MD", [
    ["Pipeline SC", "baltimore", "Baltimore", "21224", 39.2850, -76.5640, [MLSN, GA]],
    ["Baltimore Armour", "baltimore", "Baltimore", "21209", 39.3720, -76.6720, [MLSN, NPL]],
    ["Maryland United FC", "baltimore", "Ellicott City", "21043", 39.2673, -76.7983, [MLSN, ECRL]],
    ["Soccer Association of Columbia", "baltimore", "Columbia", "21044", 39.2037, -76.8610, [ECRL, NPL]],
    ["Maryland Rush", "baltimore", "Timonium", "21093", 39.4371, -76.6197, [ECRL, NL]],
    ["Baltimore County United", "baltimore", "Towson", "21204", 39.4015, -76.6019, [NL]],
    ["Harford United SC", "baltimore", "Bel Air", "21014", 39.5359, -76.3483, [NL]],
    ["Carroll County FC", "baltimore", "Westminster", "21157", 39.5754, -76.9958, [NL]],
    ["Howard County Elite FC", "baltimore", "Clarksville", "21029", 39.2068, -76.9472, [ECRL, GA]],
    ["Bethesda SC", "dc-suburbs", "Bethesda", "20817", 39.0004, -77.1529, [MLSN, GA]],
    ["Potomac Soccer Association", "dc-suburbs", "Potomac", "20854", 39.0182, -77.2086, [ECRL, NPL]],
    ["Montgomery Soccer Inc", "dc-suburbs", "Rockville", "20850", 39.0840, -77.1528, [NPL, NL]],
    ["Silver Spring United", "dc-suburbs", "Silver Spring", "20904", 39.0670, -76.9800, [NL]],
    ["Germantown FC", "dc-suburbs", "Germantown", "20874", 39.1732, -77.2717, [NL]],
    ["Prince George's United SC", "dc-suburbs", "Bowie", "20716", 38.9268, -76.7280, [NPL, DPL]],
    ["Laurel FC", "dc-suburbs", "Laurel", "20707", 39.0993, -76.8483, [NL]],
    ["Olney United", "dc-suburbs", "Olney", "20832", 39.1532, -77.0669, [NL]],
    ["Annapolis Premier SC", "annapolis-southern", "Annapolis", "21401", 38.9784, -76.4922, [ECRL, NPL]],
    ["Severna Park United", "annapolis-southern", "Severna Park", "21146", 39.0704, -76.5452, [NL]],
    ["Crofton FC", "annapolis-southern", "Crofton", "21114", 39.0018, -76.6875, [NL]],
    ["Calvert County SC", "annapolis-southern", "Prince Frederick", "20678", 38.5404, -76.5844, [NL]],
    ["Southern Maryland United", "annapolis-southern", "Waldorf", "20601", 38.6246, -76.9391, [NPL, NL]],
    ["St. Mary's County FC", "annapolis-southern", "California", "20619", 38.3004, -76.5077, [NL]],
    ["FC Frederick", "western-md", "Frederick", "21703", 39.4143, -77.4105, [ECRL, NPL]],
    ["Hagerstown United", "western-md", "Hagerstown", "21740", 39.6418, -77.7200, [NL]],
    ["Mountain Maryland FC", "western-md", "Cumberland", "21502", 39.6529, -78.7625, [NL]],
    ["Urbana United SC", "western-md", "Urbana", "21704", 39.3257, -77.3511, [NL]],
    ["Salisbury FC", "eastern-shore", "Salisbury", "21801", 38.3607, -75.5994, [NL]],
    ["Talbot County United", "eastern-shore", "Easton", "21601", 38.7743, -76.0763, [NL]],
    ["Ocean City Youth SC", "eastern-shore", "Berlin", "21811", 38.3226, -75.2177, [NL]],
  ]),

  // ---------------------------- Washington ----------------------------
  ...state("WA", [
    ["Seattle Sounders FC Academy", "seattle-eastside", "Tukwila", "98188", 47.4740, -122.2610, [MLSN]],
    ["Crossfire Premier", "seattle-eastside", "Redmond", "98052", 47.6740, -122.1215, [ECNL, MLSN]],
    ["Seattle United", "seattle-eastside", "Seattle", "98103", 47.6730, -122.3420, [ECNL, MLSN]],
    ["Eastside FC", "seattle-eastside", "Issaquah", "98027", 47.5301, -122.0326, [ECNL, MLSN]],
    ["Pacific Northwest SC", "seattle-eastside", "Kent", "98032", 47.3809, -122.2348, [ECNL, MLSN]],
    ["Sporting Seattle", "seattle-eastside", "Woodinville", "98072", 47.7543, -122.1635, [ECRL, NPL]],
    ["Bellevue United FC", "seattle-eastside", "Bellevue", "98004", 47.6101, -122.2015, [ECRL, NL]],
    ["Lake Washington Youth Soccer", "seattle-eastside", "Kirkland", "98033", 47.6769, -122.2060, [NL]],
    ["Renton FC", "seattle-eastside", "Renton", "98055", 47.4829, -122.2171, [NL]],
    ["Federal Way United", "seattle-eastside", "Federal Way", "98003", 47.3223, -122.3126, [NPL, NL]],
    ["Washington Premier FC", "tacoma-south-sound", "Puyallup", "98371", 47.1854, -122.2929, [ECNL, MLSN]],
    ["Harbor Premier FC", "tacoma-south-sound", "Gig Harbor", "98335", 47.3293, -122.5801, [ECRL, NPL]],
    ["Tacoma United SC", "tacoma-south-sound", "Tacoma", "98405", 47.2529, -122.4443, [NPL, NL]],
    ["South Sound FC", "tacoma-south-sound", "Lacey", "98503", 47.0343, -122.8232, [NL]],
    ["Olympia United", "tacoma-south-sound", "Olympia", "98501", 47.0379, -122.9007, [NL]],
    ["Kitsap Alliance FC", "tacoma-south-sound", "Silverdale", "98383", 47.6445, -122.6946, [NL]],
    ["Washington Rush", "north-sound", "Snohomish", "98290", 47.9129, -122.0982, [ECRL, NPL]],
    ["Everett United SC", "north-sound", "Everett", "98208", 47.9000, -122.2000, [NL]],
    ["Whatcom FC Rangers", "north-sound", "Bellingham", "98226", 48.7700, -122.4500, [ECRL, NL]],
    ["Skagit United", "north-sound", "Mount Vernon", "98273", 48.4212, -122.3341, [NL]],
    ["Mill Creek FC", "north-sound", "Mill Creek", "98012", 47.8601, -122.2043, [NL]],
    ["Clark County Premier FC", "southwest-wa", "Vancouver", "98683", 45.6030, -122.5100, [ECRL, NPL]],
    ["Vancouver United SC", "southwest-wa", "Vancouver", "98686", 45.7150, -122.6400, [NL]],
    ["Camas Washougal FC", "southwest-wa", "Camas", "98607", 45.5871, -122.3995, [NL]],
    ["Longview United", "southwest-wa", "Longview", "98632", 46.1382, -122.9382, [NL]],
    ["Spokane Shadow", "eastern-wa", "Spokane", "99223", 47.6100, -117.3600, [ECRL, NPL]],
    ["FC Spokane Youth", "eastern-wa", "Spokane Valley", "99216", 47.6732, -117.2394, [NPL, NL]],
    ["Three Rivers SC", "eastern-wa", "Kennewick", "99336", 46.2112, -119.1372, [NL]],
    ["Yakima United FC", "eastern-wa", "Yakima", "98902", 46.6021, -120.5059, [NL]],
    ["Wenatchee Valley SC", "eastern-wa", "Wenatchee", "98801", 47.4235, -120.3103, [NL]],
  ]),

  // ---------------------------- Colorado ----------------------------
  ...state("CO", [
    ["Colorado Rapids Academy", "denver-metro", "Commerce City", "80022", 39.8083, -104.9339, [MLSN]],
    ["Real Colorado", "denver-metro", "Centennial", "80112", 39.5791, -104.8769, [ECNL, MLSN]],
    ["Colorado Rush", "denver-metro", "Littleton", "80127", 39.5850, -105.1250, [ECNL, MLSN]],
    ["Colorado Storm", "denver-metro", "Aurora", "80016", 39.6000, -104.7400, [ECRL, NPL]],
    ["Arsenal Colorado", "denver-metro", "Highlands Ranch", "80126", 39.5539, -104.9694, [ECRL, NPL]],
    ["Colorado Rapids Youth SC", "denver-metro", "Lakewood", "80228", 39.6950, -105.1550, [ECRL, NL]],
    ["Denver United FC", "denver-metro", "Denver", "80210", 39.6780, -104.9620, [NPL, DPL]],
    ["Westminster Elite SC", "denver-metro", "Westminster", "80031", 39.8367, -105.0372, [NL]],
    ["Parker FC", "denver-metro", "Parker", "80134", 39.5186, -104.7614, [NL]],
    ["Castle Rock United", "denver-metro", "Castle Rock", "80104", 39.3722, -104.8561, [NL]],
    ["Golden FC", "denver-metro", "Golden", "80401", 39.7555, -105.2211, [NL]],
    ["Brighton United SC", "denver-metro", "Brighton", "80601", 39.9853, -104.8205, [NL]],
    ["Broomfield FC", "denver-metro", "Broomfield", "80020", 39.9205, -105.0867, [ECRL, GA]],
    ["Boulder County Force", "boulder-northern", "Boulder", "80301", 40.0490, -105.2100, [ECRL, NPL]],
    ["FC Boulder", "boulder-northern", "Boulder", "80303", 39.9900, -105.2300, [ECRL, NL]],
    ["Longmont United SC", "boulder-northern", "Longmont", "80501", 40.1672, -105.1019, [NL]],
    ["Fort Collins Soccer Club", "boulder-northern", "Fort Collins", "80525", 40.5300, -105.0400, [ECRL, NPL]],
    ["Northern Colorado FC", "boulder-northern", "Loveland", "80538", 40.4220, -105.0750, [NL]],
    ["Greeley United", "boulder-northern", "Greeley", "80634", 40.3964, -104.7900, [NL]],
    ["Erie Youth SC", "boulder-northern", "Erie", "80516", 40.0503, -105.0500, [NL]],
    ["Pride Soccer Club", "colorado-springs", "Colorado Springs", "80919", 38.9264, -104.8590, [ECRL, NPL]],
    ["Colorado Springs United", "colorado-springs", "Colorado Springs", "80920", 38.9500, -104.7700, [NL]],
    ["Pikes Peak FC", "colorado-springs", "Monument", "80132", 39.0917, -104.8727, [NL]],
    ["Fountain Valley SC", "colorado-springs", "Fountain", "80817", 38.6822, -104.7008, [NL]],
    ["Pueblo FC", "colorado-springs", "Pueblo", "81001", 38.2930, -104.5710, [NL]],
    ["Western Slope FC", "western-slope", "Grand Junction", "81501", 39.0639, -108.5506, [NPL, NL]],
    ["Durango United SC", "western-slope", "Durango", "81301", 37.2753, -107.8801, [NL]],
    ["Roaring Fork FC", "western-slope", "Glenwood Springs", "81601", 39.5505, -107.3248, [NL]],
    ["Summit County United", "western-slope", "Frisco", "80443", 39.5744, -106.0975, [NL]],
    ["Vail Valley SC", "western-slope", "Edwards", "81632", 39.6450, -106.5940, [NL]],
  ]),

  // ---------------------------- Arizona ----------------------------
  ...state("AZ", [
    ["Phoenix Rising FC Youth", "phoenix-west", "Phoenix", "85034", 33.4350, -112.0100, [MLSN, ECNL]],
    ["CCV Stars", "phoenix-west", "Peoria", "85383", 33.7300, -112.2700, [ECRL, NPL]],
    ["Sereno Soccer Club", "phoenix-west", "Phoenix", "85028", 33.5850, -112.0100, [ECRL, NPL]],
    ["Arizona Soccer Club", "phoenix-west", "Glendale", "85308", 33.6600, -112.2000, [NPL, DPL]],
    ["West Valley United FC", "phoenix-west", "Surprise", "85374", 33.6292, -112.3680, [NL]],
    ["Goodyear FC", "phoenix-west", "Goodyear", "85395", 33.4700, -112.4000, [NL]],
    ["Avondale Youth SC", "phoenix-west", "Avondale", "85323", 33.4356, -112.3496, [NL]],
    ["North Phoenix United", "phoenix-west", "Phoenix", "85085", 33.7700, -112.0900, [ECRL, NL]],
    ["Buckeye United", "phoenix-west", "Buckeye", "85326", 33.3703, -112.5838, [NL]],
    ["RSL Arizona", "east-valley", "Mesa", "85212", 33.3300, -111.6400, [MLSN, ECNL]],
    ["SC del Sol", "east-valley", "Phoenix", "85044", 33.3300, -111.9900, [ECNL, MLSN]],
    ["Arizona Arsenal SC", "east-valley", "Mesa", "85205", 33.4350, -111.7200, [ECRL, NPL]],
    ["Scottsdale United FC", "east-valley", "Scottsdale", "85260", 33.6100, -111.8900, [ECRL, GA]],
    ["Tempe FC", "east-valley", "Tempe", "85283", 33.3650, -111.9300, [NL]],
    ["Chandler United SC", "east-valley", "Chandler", "85226", 33.3062, -111.9400, [NPL, NL]],
    ["Gilbert Premier FC", "east-valley", "Gilbert", "85296", 33.3350, -111.7400, [ECRL, NL]],
    ["Queen Creek United", "east-valley", "Queen Creek", "85142", 33.2487, -111.6343, [NL]],
    ["Ahwatukee FC", "east-valley", "Phoenix", "85048", 33.3100, -112.0500, [NL]],
    ["Fountain Hills SC", "east-valley", "Fountain Hills", "85268", 33.6117, -111.7174, [NL]],
    ["FC Tucson Youth", "tucson-southern", "Tucson", "85718", 32.3100, -110.9200, [ECRL, NPL]],
    ["Tucson Soccer Academy", "tucson-southern", "Tucson", "85741", 32.3400, -111.0100, [ECRL, GA]],
    ["Southern Arizona United", "tucson-southern", "Tucson", "85710", 32.2200, -110.8200, [NL]],
    ["Marana United", "tucson-southern", "Marana", "85658", 32.4300, -111.1500, [NL]],
    ["Oro Valley FC", "tucson-southern", "Oro Valley", "85737", 32.4200, -110.9500, [NL]],
    ["Sierra Vista SC", "tucson-southern", "Sierra Vista", "85635", 31.5455, -110.2773, [NL]],
    ["Yuma United FC", "tucson-southern", "Yuma", "85364", 32.6927, -114.6277, [NL]],
    ["Flagstaff United SC", "northern-az", "Flagstaff", "86001", 35.1983, -111.6513, [NL]],
    ["Prescott FC", "northern-az", "Prescott", "86301", 34.5400, -112.4685, [NL]],
    ["Verde Valley SC", "northern-az", "Cottonwood", "86326", 34.7392, -112.0099, [NL]],
    ["Lake Havasu United", "northern-az", "Lake Havasu City", "86403", 34.4839, -114.3225, [NL]],
  ]),

  // ---------------------------- Massachusetts ----------------------------
  ...state("MA", [
    ["Boston Bolts", "boston-metro", "Newton", "02459", 42.3220, -71.1920, [MLSN, GA]],
    ["Valeo FC", "boston-metro", "Waltham", "02451", 42.3765, -71.2356, [MLSN, NPL]],
    ["Scorpions SC", "boston-metro", "Westwood", "02090", 42.2140, -71.2245, [NPL, ECRL]],
    ["Global Premier Soccer Massachusetts", "boston-metro", "Woburn", "01801", 42.4793, -71.1523, [MLSN, NPL]],
    ["Lexington United SC", "boston-metro", "Lexington", "02421", 42.4430, -71.2290, [ECRL, NL]],
    ["Needham FC", "boston-metro", "Needham", "02492", 42.2809, -71.2378, [NL]],
    ["Wellesley Youth SC", "boston-metro", "Wellesley", "02481", 42.2968, -71.2924, [NL]],
    ["Boston City FC Youth", "boston-metro", "Boston", "02125", 42.3150, -71.0570, [NPL, DPL]],
    ["Framingham United", "boston-metro", "Framingham", "01701", 42.2793, -71.4162, [NL]],
    ["Seacoast United Massachusetts", "north-shore-merrimack", "Hamilton", "01982", 42.6187, -70.8565, [ECRL, NPL]],
    ["North Shore United SC", "north-shore-merrimack", "Beverly", "01915", 42.5584, -70.8800, [NL]],
    ["Merrimack Valley FC", "north-shore-merrimack", "Andover", "01810", 42.6583, -71.1368, [ECRL, NL]],
    ["Lowell United", "north-shore-merrimack", "Lowell", "01852", 42.6334, -71.3162, [NL]],
    ["Chelmsford FC", "north-shore-merrimack", "Chelmsford", "01824", 42.5998, -71.3673, [NL]],
    ["Newburyport SC", "north-shore-merrimack", "Newburyport", "01950", 42.8126, -70.8773, [NL]],
    ["New England Revolution Academy", "south-shore-cape", "Foxborough", "02035", 42.0654, -71.2478, [MLSN]],
    ["NEFC", "south-shore-cape", "Mendon", "01756", 42.1057, -71.5523, [ECNL, MLSN]],
    ["South Shore Select", "south-shore-cape", "Hingham", "02043", 42.2418, -70.8898, [ECRL, NPL]],
    ["Bayside FC", "south-shore-cape", "Plymouth", "02360", 41.9584, -70.6673, [NPL, NL]],
    ["South Coast United", "south-shore-cape", "Dartmouth", "02747", 41.6150, -70.9900, [NL]],
    ["Cape Cod Soccer Club", "south-shore-cape", "Barnstable", "02630", 41.7003, -70.3002, [NL]],
    ["Brockton FC Youth", "south-shore-cape", "Brockton", "02301", 42.0834, -71.0184, [NL]],
    ["FC Stars of Massachusetts", "central-ma", "Lancaster", "01523", 42.4559, -71.6731, [ECNL, MLSN]],
    ["Worcester United SC", "central-ma", "Worcester", "01605", 42.2900, -71.7900, [NPL, NL]],
    ["Shrewsbury FC", "central-ma", "Shrewsbury", "01545", 42.2959, -71.7129, [NL]],
    ["Wachusett United", "central-ma", "Holden", "01520", 42.3518, -71.8634, [NL]],
    ["Western Mass Pioneers", "western-ma", "Ludlow", "01056", 42.1601, -72.4759, [NPL, NL]],
    ["Pioneer Valley FC", "western-ma", "Northampton", "01060", 42.3251, -72.6412, [NL]],
    ["Greater Springfield SC", "western-ma", "Springfield", "01109", 42.1200, -72.5500, [NL]],
    ["Berkshire United", "western-ma", "Pittsfield", "01201", 42.4501, -73.2454, [NL]],
  ]),

  /* ------------------------------------------------------------------
   *  The remaining states have no predefined regions: clubs list by
   *  city / ZIP and rank within their state. Rows marked "unverified"
   *  are plausible local names that should be spot-checked (or removed)
   *  before anyone relies on them.
   * ------------------------------------------------------------------ */

  // ---------------------------- Alabama ----------------------------
  ...cities("AL", [
    ["Birmingham United Soccer Association", "Birmingham", "35242", 33.4207, -86.6732, [ECRL, NPL]],
    ["Alabama FC", "Birmingham", "35209", 33.4651, -86.8085, [ECNL, ECRL]],
    ["Vestavia Hills Soccer Club", "Vestavia Hills", "35216", 33.4487, -86.7878, [ECRL, NL]],
    ["Hoover Soccer Club", "Hoover", "35244", 33.3540, -86.8250, [NL]],
    ["Huntsville Futbol Club", "Huntsville", "35806", 34.7600, -86.6700, [ECRL, NPL]],
    ["Madison Soccer Association", "Madison", "35758", 34.6993, -86.7483, [NL]], // unverified
    ["Mobile United FC", "Mobile", "36608", 30.6900, -88.1700, [NPL, NL]],
    ["Capital City Streaks", "Montgomery", "36117", 32.3668, -86.1500, [NL]],
    ["Auburn Soccer Association", "Auburn", "36830", 32.6099, -85.4808, [NL]],
    ["Tuscaloosa Soccer Club", "Tuscaloosa", "35406", 33.2098, -87.5692, [NL]], // unverified
  ]),

  // ---------------------------- Alaska ----------------------------
  ...cities("AK", [
    ["Alaska Rush Soccer Club", "Anchorage", "99507", 61.1500, -149.8300, [NPL, NL]],
    ["Cook Inlet Soccer Club", "Anchorage", "99515", 61.1200, -149.8900, [NL]],
    ["Eagle River Soccer Club", "Eagle River", "99577", 61.3214, -149.5678, [NL]], // unverified
    ["Mat-Su United", "Wasilla", "99654", 61.5814, -149.4394, [NL]], // unverified
    ["Kenai Peninsula United", "Soldotna", "99669", 60.4878, -151.0583, [NL]], // unverified
    ["Fairbanks Youth Soccer Association", "Fairbanks", "99709", 64.8401, -147.7200, [NL]],
    ["Juneau Soccer Club", "Juneau", "99801", 58.3019, -134.4197, [NL]], // unverified
  ]),

  // ---------------------------- Arkansas ----------------------------
  ...cities("AR", [
    ["Arkansas Rising", "Little Rock", "72223", 34.7900, -92.4100, [ECRL, NPL]],
    ["Arkansas Rush", "Bentonville", "72712", 36.3729, -94.2088, [ECRL, NPL]],
    ["FC Arkansas", "Little Rock", "72205", 34.7465, -92.3500, [NL]], // unverified
    ["Fayetteville Soccer Club", "Fayetteville", "72703", 36.1000, -94.1500, [NL]], // unverified
    ["Rogers Soccer Club", "Rogers", "72756", 36.3320, -94.1185, [NL]], // unverified
    ["Conway Soccer Club", "Conway", "72034", 35.0887, -92.4421, [NL]], // unverified
    ["Jonesboro United", "Jonesboro", "72401", 35.8423, -90.7043, [NL]], // unverified
    ["Fort Smith Soccer Club", "Fort Smith", "72903", 35.3500, -94.3700, [NL]], // unverified
    ["Bryant Soccer Club", "Bryant", "72022", 34.5959, -92.4890, [NL]], // unverified
    ["Hot Springs Soccer Club", "Hot Springs", "71901", 34.5037, -93.0552, [NL]], // unverified
  ]),

  // ---------------------------- Connecticut ----------------------------
  ...cities("CT", [
    ["Beachside Soccer Club", "Norwalk", "06851", 41.1300, -73.4100, [MLSN, ECNL]],
    ["FSA FC", "Farmington", "06032", 41.7198, -72.8320, [ECNL, MLSN]],
    ["Oakwood Soccer Club", "Glastonbury", "06033", 41.7123, -72.6082, [ECNL, ECRL]],
    ["AC Connecticut", "Newtown", "06470", 41.4140, -73.3035, [NPL, ECRL]],
    ["Connecticut FC", "Wallingford", "06492", 41.4570, -72.8231, [NPL, NL]], // unverified city
    ["Greenwich Soccer Club", "Greenwich", "06830", 41.0262, -73.6282, [NL]],
    ["Westport Soccer Association", "Westport", "06880", 41.1415, -73.3579, [NL]],
    ["Hartford Athletic Youth Academy", "Hartford", "06106", 41.7480, -72.6950, [NPL]], // unverified
    ["New Haven United", "New Haven", "06511", 41.3083, -72.9279, [NL]], // unverified
    ["Stamford FC", "Stamford", "06902", 41.0534, -73.5387, [NL]], // unverified
  ]),

  // ---------------------------- Delaware ----------------------------
  ...cities("DE", [
    ["Delaware Rush", "Wilmington", "19803", 39.7900, -75.5400, [ECRL, NPL]],
    ["Delaware FC", "Wilmington", "19801", 39.7391, -75.5398, [NPL, NL]],
    ["Kirkwood Soccer Club", "Wilmington", "19808", 39.7400, -75.6800, [NL]],
    ["Hockessin Soccer Club", "Hockessin", "19707", 39.7876, -75.6966, [NL]],
    ["Newark FC", "Newark", "19711", 39.6837, -75.7497, [NL]], // unverified
    ["Middletown United", "Middletown", "19709", 39.4496, -75.7163, [NL]], // unverified
    ["Dover FC", "Dover", "19901", 39.1582, -75.5244, [NL]], // unverified
    ["Sussex County United", "Lewes", "19958", 38.7746, -75.1393, [NL]], // unverified
  ]),

  // ---------------------------- Hawaii ----------------------------
  ...cities("HI", [
    ["Hawaii Rush", "Honolulu", "96819", 21.3400, -157.8800, [ECRL, NPL]],
    ["Honolulu Bulls Soccer Club", "Honolulu", "96822", 21.3100, -157.8200, [ECRL, NPL]],
    ["Leahi Soccer Club", "Honolulu", "96816", 21.2850, -157.8000, [NL]],
    ["Hawaii Surf Soccer Club", "Honolulu", "96813", 21.3100, -157.8500, [NL]],
    ["Windward Soccer Club", "Kailua", "96734", 21.4022, -157.7394, [NL]], // unverified
    ["Central Oahu FC", "Mililani", "96789", 21.4513, -158.0153, [NL]], // unverified
    ["Maui United", "Kahului", "96732", 20.8893, -156.4729, [NL]], // unverified
    ["Kona Soccer Club", "Kailua-Kona", "96740", 19.6400, -155.9969, [NL]], // unverified
  ]),

  // ---------------------------- Idaho ----------------------------
  ...cities("ID", [
    ["Boise Timbers Thorns FC", "Boise", "83704", 43.6300, -116.2900, [ECNL, ECRL]],
    ["Idaho Juniors", "Boise", "83709", 43.5700, -116.2900, [ECNL, NPL]],
    ["Idaho Rush", "Boise", "83713", 43.6300, -116.3300, [ECRL, NPL]],
    ["Meridian United", "Meridian", "83646", 43.6400, -116.4000, [NL]], // unverified
    ["Nampa FC", "Nampa", "83686", 43.5407, -116.5635, [NL]], // unverified
    ["Coeur d'Alene Soccer Club", "Coeur d'Alene", "83814", 47.6777, -116.7805, [NL]], // unverified
    ["Idaho Falls Soccer Club", "Idaho Falls", "83402", 43.4917, -112.0339, [NL]], // unverified
    ["Pocatello United", "Pocatello", "83201", 42.8713, -112.4455, [NL]], // unverified
    ["Twin Falls FC", "Twin Falls", "83301", 42.5630, -114.4609, [NL]], // unverified
  ]),

  // ---------------------------- Indiana ----------------------------
  ...cities("IN", [
    ["Indiana Fire Academy", "Westfield", "46074", 40.0428, -86.1275, [MLSN, ECNL]],
    ["Indy Premier Soccer Club", "Carmel", "46032", 39.9784, -86.1180, [ECNL, ECRL]],
    ["Carmel FC", "Carmel", "46033", 39.9700, -86.0800, [ECRL, NPL]],
    ["Fort Wayne United FC", "Fort Wayne", "46804", 41.0500, -85.2200, [NPL, NL]],
    ["Zionsville Youth Soccer Association", "Zionsville", "46077", 39.9509, -86.2617, [NL]],
    ["Indianapolis City FC", "Indianapolis", "46220", 39.8700, -86.1100, [NL]], // unverified
    ["Bloomington United", "Bloomington", "47401", 39.1653, -86.5264, [NL]], // unverified
    ["Lafayette FC", "Lafayette", "47905", 40.4167, -86.8753, [NL]], // unverified
    ["South Bend United SC", "South Bend", "46617", 41.6764, -86.2520, [NL]], // unverified
    ["Evansville FC", "Evansville", "47715", 37.9716, -87.5711, [NL]], // unverified
  ]),

  // ---------------------------- Iowa ----------------------------
  ...cities("IA", [
    ["Iowa Rush", "West Des Moines", "50266", 41.5772, -93.7113, [ECNL, ECRL]],
    ["Des Moines Menace Academy", "Des Moines", "50322", 41.6300, -93.7400, [NPL, NL]],
    ["Iowa Soccer Club", "Cedar Rapids", "52402", 42.0300, -91.6600, [NPL, NL]], // unverified
    ["Iowa City Alliance SC", "Iowa City", "52240", 41.6611, -91.5302, [NL]], // unverified
    ["Ankeny Soccer Club", "Ankeny", "50023", 41.7318, -93.6001, [NL]], // unverified
    ["Ames Soccer Club", "Ames", "50010", 42.0308, -93.6319, [NL]], // unverified
    ["Quad City United", "Davenport", "52806", 41.5700, -90.6000, [NL]], // unverified
    ["Dubuque Soccer Club", "Dubuque", "52001", 42.5006, -90.6646, [NL]], // unverified
    ["Sioux City FC", "Sioux City", "51106", 42.4500, -96.3400, [NL]], // unverified
    ["Cedar Valley United", "Waterloo", "50701", 42.4928, -92.3426, [NL]], // unverified
  ]),

  // ---------------------------- Kansas ----------------------------
  ...cities("KS", [
    ["Sporting Kansas City Academy", "Kansas City", "66111", 39.1200, -94.8300, [MLSN]],
    ["Sporting Blue Valley", "Overland Park", "66213", 38.9000, -94.7000, [ECNL, ECRL]],
    ["KC Fusion Soccer Club", "Overland Park", "66210", 38.9300, -94.7100, [ECRL, NPL]],
    ["Kansas Rush", "Lenexa", "66219", 38.9500, -94.7700, [ECRL, NPL]],
    ["Sporting Wichita", "Wichita", "67226", 37.7400, -97.2400, [ECRL, NPL]],
    ["Wichita Elite SC", "Wichita", "67212", 37.6900, -97.4300, [NL]], // unverified
    ["Topeka Soccer Club", "Topeka", "66614", 39.0100, -95.7600, [NL]], // unverified
    ["Lawrence Soccer Club", "Lawrence", "66049", 38.9700, -95.2800, [NL]], // unverified
    ["Manhattan Soccer Club", "Manhattan", "66502", 39.1836, -96.5717, [NL]], // unverified
    ["Salina FC", "Salina", "67401", 38.8403, -97.6114, [NL]], // unverified
  ]),

  // ---------------------------- Kentucky ----------------------------
  ...cities("KY", [
    ["Louisville City FC Academy", "Louisville", "40202", 38.2527, -85.7585, [MLSN]],
    ["Racing Louisville Academy", "Louisville", "40216", 38.1900, -85.8300, [ECNL]],
    ["Javanon FC", "Louisville", "40299", 38.1800, -85.5600, [ECRL, NPL]],
    ["Kings Soccer Academy", "Lexington", "40511", 38.0800, -84.5000, [ECNL, ECRL]],
    ["Kentucky Fire Juniors", "Louisville", "40245", 38.2600, -85.4700, [ECRL, NPL]],
    ["Lexington FC Academy", "Lexington", "40505", 38.0600, -84.4600, [NPL]], // unverified
    ["Northern Kentucky United", "Florence", "41042", 38.9989, -84.6266, [NL]], // unverified
    ["Bowling Green FC", "Bowling Green", "42101", 36.9900, -86.4500, [NL]], // unverified
    ["Owensboro Soccer Club", "Owensboro", "42301", 37.7719, -87.1112, [NL]], // unverified
    ["Paducah United", "Paducah", "42001", 37.0834, -88.6000, [NL]], // unverified
  ]),

  // ---------------------------- Louisiana ----------------------------
  ...cities("LA", [
    ["Louisiana Fire", "Metairie", "70001", 29.9841, -90.1529, [ECNL, ECRL]],
    ["Baton Rouge Soccer Club", "Baton Rouge", "70809", 30.4000, -91.0700, [ECRL, NPL]],
    ["Nola Rush", "Mandeville", "70471", 30.3800, -90.0700, [ECRL, NPL]], // unverified
    ["FC Louisiana", "Baton Rouge", "70810", 30.3500, -91.0900, [NL]], // unverified
    ["Lafayette Futbol Club", "Lafayette", "70503", 30.1800, -92.0400, [NL]], // unverified
    ["Northshore United", "Covington", "70433", 30.4755, -90.1009, [NL]], // unverified
    ["New Orleans United", "New Orleans", "70118", 29.9400, -90.1200, [NL]], // unverified
    ["Shreveport United", "Shreveport", "71105", 32.4500, -93.7200, [NL]], // unverified
    ["Lake Charles Soccer Club", "Lake Charles", "70605", 30.1700, -93.2200, [NL]], // unverified
    ["Monroe FC", "Monroe", "71201", 32.5093, -92.1193, [NL]], // unverified
  ]),

  // ---------------------------- Maine ----------------------------
  ...cities("ME", [
    ["Seacoast United Maine", "Falmouth", "04105", 43.7295, -70.2420, [ECRL, NPL]],
    ["Portland FC Youth", "Portland", "04101", 43.6591, -70.2568, [NL]], // unverified
    ["Southern Maine United", "Scarborough", "04074", 43.5781, -70.3217, [NL]], // unverified
    ["Saco Bay United", "Saco", "04072", 43.5009, -70.4428, [NL]], // unverified
    ["Kennebunk FC", "Kennebunk", "04043", 43.3842, -70.5445, [NL]], // unverified
    ["Brunswick Soccer Club", "Brunswick", "04011", 43.9145, -69.9653, [NL]], // unverified
    ["Lewiston-Auburn United", "Auburn", "04210", 44.0979, -70.2312, [NL]], // unverified
    ["Augusta United", "Augusta", "04330", 44.3106, -69.7795, [NL]], // unverified
    ["Bangor FC", "Bangor", "04401", 44.8016, -68.7712, [NL]], // unverified
  ]),

  // ---------------------------- Michigan ----------------------------
  ...cities("MI", [
    ["Michigan Wolves", "Livonia", "48152", 42.4300, -83.3700, [MLSN, ECNL]],
    ["Michigan Jaguars", "Novi", "48375", 42.4800, -83.4700, [MLSN, ECNL]],
    ["Michigan Nationals", "Farmington Hills", "48334", 42.5000, -83.3500, [MLSN, ECNL]],
    ["Vardar Soccer Club", "Waterford", "48327", 42.6600, -83.4000, [MLSN, NPL]],
    ["Michigan Hawks", "Livonia", "48154", 42.4000, -83.3800, [ECNL, ECRL]],
    ["Midwest United FC", "Kentwood", "49512", 42.8695, -85.6447, [ECNL, MLSN]],
    ["Detroit City FC Academy", "Detroit", "48207", 42.3500, -83.0300, [NPL, ECRL]],
    ["Grand Rapids FC Youth", "Grand Rapids", "49503", 42.9634, -85.6681, [NPL]], // unverified
    ["Lansing United Youth", "Lansing", "48911", 42.6800, -84.5700, [NL]], // unverified
    ["Kalamazoo FC Youth", "Kalamazoo", "49008", 42.2700, -85.6100, [NL]], // unverified
  ]),

  // ---------------------------- Minnesota ----------------------------
  ...cities("MN", [
    ["Minnesota United FC Academy", "Blaine", "55449", 45.1700, -93.1900, [MLSN]],
    ["Shattuck-St. Mary's Soccer", "Faribault", "55021", 44.2950, -93.2688, [MLSN, ECNL]],
    ["Minnesota Thunder Academy", "Burnsville", "55337", 44.7600, -93.2800, [ECNL, ECRL]],
    ["Minneapolis United SC", "Minneapolis", "55406", 44.9400, -93.2200, [ECNL, ECRL]],
    ["Salvo Soccer Club", "Lakeville", "55044", 44.6497, -93.2428, [ECRL, NPL]],
    ["St. Croix Soccer Club", "Woodbury", "55125", 44.9200, -92.9400, [ECRL, NPL]],
    ["Tonka United", "Minnetonka", "55345", 44.9133, -93.5033, [NPL, NL]],
    ["Rochester FC", "Rochester", "55901", 44.0600, -92.5000, [NL]], // unverified
    ["Duluth FC Youth", "Duluth", "55811", 46.8100, -92.1700, [NL]], // unverified
    ["St. Cloud United", "St. Cloud", "56301", 45.5579, -94.1632, [NL]], // unverified
  ]),

  // ---------------------------- Mississippi ----------------------------
  ...cities("MS", [
    ["Mississippi Rush", "Ridgeland", "39157", 32.4285, -90.1323, [ECRL, NPL]],
    ["Mississippi FC", "Madison", "39110", 32.4618, -90.1153, [NL]], // unverified
    ["Oxford Soccer Club", "Oxford", "38655", 34.3665, -89.5192, [NL]], // unverified
    ["Starkville Soccer Club", "Starkville", "39759", 33.4504, -88.8184, [NL]], // unverified
    ["Hattiesburg FC", "Hattiesburg", "39402", 31.3271, -89.3500, [NL]], // unverified
    ["Gulf Coast United", "Gulfport", "39503", 30.4300, -89.0900, [NL]], // unverified
    ["Tupelo FC", "Tupelo", "38804", 34.2576, -88.7034, [NL]], // unverified
    ["DeSoto County United", "Southaven", "38671", 34.9700, -90.0100, [NL]], // unverified
  ]),

  // ---------------------------- Missouri ----------------------------
  ...cities("MO", [
    ["St. Louis City SC Academy", "St. Louis", "63103", 38.6315, -90.2100, [MLSN]],
    ["St. Louis Scott Gallagher SC", "St. Louis", "63146", 38.7000, -90.4600, [ECNL, MLSN]],
    ["Lou Fusz Athletic", "St. Louis", "63141", 38.6600, -90.4600, [ECRL, NPL]],
    ["Missouri Rush", "Lee's Summit", "64081", 38.9108, -94.3822, [ECRL, NPL]],
    ["Sporting Springfield", "Springfield", "65804", 37.1700, -93.2400, [ECRL, NPL]],
    ["Kansas City Athletics", "Kansas City", "64114", 38.9600, -94.6000, [NPL]], // unverified
    ["Columbia Soccer Club", "Columbia", "65203", 38.9300, -92.3600, [NL]], // unverified
    ["St. Charles United", "St. Charles", "63303", 38.7800, -90.5400, [NL]], // unverified
    ["Joplin FC", "Joplin", "64801", 37.0842, -94.5133, [NL]], // unverified
    ["Jefferson City Soccer Club", "Jefferson City", "65109", 38.5767, -92.1735, [NL]], // unverified
  ]),

  // ---------------------------- Montana ----------------------------
  ...cities("MT", [
    ["Missoula Strikers", "Missoula", "59801", 46.8721, -113.9940, [NL]],
    ["Flathead Rapids FC", "Kalispell", "59901", 48.1958, -114.3129, [NL]],
    ["Billings United SC", "Billings", "59102", 45.7800, -108.5700, [NL]], // unverified
    ["Bozeman Blitz FC", "Bozeman", "59715", 45.6770, -111.0429, [NL]], // unverified
    ["Helena Youth Soccer", "Helena", "59601", 46.5891, -112.0391, [NL]], // unverified
    ["Great Falls United", "Great Falls", "59405", 47.4900, -111.2900, [NL]], // unverified
    ["Butte FC", "Butte", "59701", 46.0038, -112.5348, [NL]], // unverified
  ]),

  // ---------------------------- Nebraska ----------------------------
  ...cities("NE", [
    ["Sporting Nebraska FC", "Omaha", "68137", 41.2100, -96.1200, [ECRL, NPL]],
    ["Omaha FC", "Omaha", "68144", 41.2300, -96.1200, [NPL, NL]], // unverified
    ["Lincoln Elite FC", "Lincoln", "68516", 40.7400, -96.6600, [NL]], // unverified
    ["Elkhorn Soccer Club", "Elkhorn", "68022", 41.2864, -96.2364, [NL]], // unverified
    ["Papillion United", "Papillion", "68046", 41.1544, -96.0422, [NL]], // unverified
    ["Bellevue FC", "Bellevue", "68123", 41.1200, -95.9600, [NL]], // unverified
    ["Kearney FC", "Kearney", "68845", 40.6993, -99.0817, [NL]], // unverified
    ["Grand Island United", "Grand Island", "68803", 40.9250, -98.3420, [NL]], // unverified
  ]),

  // ---------------------------- Nevada ----------------------------
  ...cities("NV", [
    ["Las Vegas Sports Academy", "Las Vegas", "89148", 36.0600, -115.2900, [ECRL, NPL]],
    ["Heat FC", "Henderson", "89052", 36.0000, -115.1100, [ECRL, NPL]],
    ["Downtown Las Vegas Soccer Club", "Las Vegas", "89101", 36.1700, -115.1400, [NPL]],
    ["Henderson Elite SC", "Henderson", "89012", 36.0100, -115.0400, [NL]], // unverified
    ["Summerlin United", "Las Vegas", "89135", 36.1100, -115.3300, [NL]], // unverified
    ["North Las Vegas FC", "North Las Vegas", "89031", 36.2600, -115.1700, [NL]], // unverified
    ["Nevada Rush", "Reno", "89523", 39.5300, -119.9000, [ECRL, NPL]], // unverified
    ["Reno United FC", "Reno", "89502", 39.4900, -119.7700, [NL]], // unverified
    ["Sparks Soccer Club", "Sparks", "89431", 39.5349, -119.7527, [NL]], // unverified
    ["Carson City FC", "Carson City", "89701", 39.1638, -119.7674, [NL]], // unverified
  ]),

  // ---------------------------- New Hampshire ----------------------------
  ...cities("NH", [
    ["Seacoast United Soccer Club", "Hampton", "03842", 42.9376, -70.8389, [MLSN, ECNL]],
    ["Granite State FC", "Manchester", "03104", 43.0000, -71.4400, [NPL, NL]], // unverified
    ["Nashua FC", "Nashua", "03062", 42.7300, -71.4900, [NL]], // unverified
    ["Concord United", "Concord", "03301", 43.2081, -71.5376, [NL]], // unverified
    ["Bedford FC", "Bedford", "03110", 42.9465, -71.5159, [NL]], // unverified
    ["Salem Soccer Club", "Salem", "03079", 42.7884, -71.2009, [NL]], // unverified
    ["Dover Soccer Club", "Dover", "03820", 43.1979, -70.8737, [NL]], // unverified
    ["Keene United", "Keene", "03431", 42.9337, -72.2781, [NL]], // unverified
  ]),

  // ---------------------------- New Mexico ----------------------------
  ...cities("NM", [
    ["New Mexico United Academy", "Albuquerque", "87110", 35.1100, -106.5800, [NPL]],
    ["Rio Rapids Soccer Club", "Albuquerque", "87109", 35.1500, -106.5700, [ECRL, NPL]],
    ["New Mexico Rush", "Albuquerque", "87113", 35.1900, -106.5900, [ECRL, NPL]],
    ["Albuquerque Sol Academy", "Albuquerque", "87102", 35.0800, -106.6500, [NPL]], // unverified
    ["Rio Rancho FC", "Rio Rancho", "87124", 35.2500, -106.6700, [NL]], // unverified
    ["Las Cruces United", "Las Cruces", "88011", 32.3200, -106.7300, [NL]], // unverified
    ["Santa Fe Soccer Club", "Santa Fe", "87505", 35.6400, -105.9500, [NL]], // unverified
    ["Farmington United", "Farmington", "87401", 36.7281, -108.2187, [NL]], // unverified
    ["Roswell FC", "Roswell", "88201", 33.3943, -104.5230, [NL]], // unverified
  ]),

  // ---------------------------- North Dakota ----------------------------
  ...cities("ND", [
    ["Fargo Soccer Club", "Fargo", "58103", 46.8600, -96.8300, [NL]], // unverified
    ["West Fargo United", "West Fargo", "58078", 46.8750, -96.9004, [NL]], // unverified
    ["Bismarck Soccer Club", "Bismarck", "58501", 46.8083, -100.7837, [NL]], // unverified
    ["Grand Forks United", "Grand Forks", "58201", 47.9000, -97.0600, [NL]], // unverified
    ["Minot FC", "Minot", "58701", 48.2325, -101.2963, [NL]], // unverified
    ["Mandan Soccer Club", "Mandan", "58554", 46.8267, -100.8896, [NL]], // unverified
  ]),

  // ---------------------------- Oklahoma ----------------------------
  ...cities("OK", [
    ["Oklahoma FC", "Oklahoma City", "73120", 35.5800, -97.5700, [ECNL, ECRL]],
    ["Oklahoma Energy FC", "Oklahoma City", "73127", 35.4800, -97.6400, [NPL, ECRL]],
    ["Tulsa Soccer Club", "Tulsa", "74133", 36.0400, -95.8800, [ECNL, ECRL]],
    ["FC Tulsa Academy", "Tulsa", "74120", 36.1500, -95.9800, [NPL]],
    ["Edmond FC", "Edmond", "73013", 35.6200, -97.4800, [NL]], // unverified
    ["Norman United", "Norman", "73072", 35.2200, -97.5000, [NL]], // unverified
    ["Broken Arrow Soccer Club", "Broken Arrow", "74012", 36.0500, -95.8000, [NL]], // unverified
    ["Owasso United", "Owasso", "74055", 36.2696, -95.8547, [NL]], // unverified
    ["Stillwater FC", "Stillwater", "74074", 36.1156, -97.0584, [NL]], // unverified
    ["Lawton Soccer Club", "Lawton", "73505", 34.6100, -98.4600, [NL]], // unverified
  ]),

  // ---------------------------- Oregon ----------------------------
  ...cities("OR", [
    ["Portland Timbers Academy", "Beaverton", "97005", 45.4900, -122.8000, [MLSN]],
    ["FC Portland Academy", "Portland", "97230", 45.5500, -122.5000, [ECNL, MLSN]],
    ["Westside Timbers", "Hillsboro", "97124", 45.5400, -122.9300, [ECNL, ECRL]],
    ["Eastside Timbers", "Gresham", "97030", 45.5001, -122.4302, [ECRL, NPL]],
    ["Oregon Rush", "Lake Oswego", "97035", 45.4200, -122.7200, [ECRL, NPL]],
    ["Eugene Timbers FC", "Eugene", "97401", 44.0521, -123.0868, [ECRL, NPL]],
    ["Bend FC Timbers", "Bend", "97701", 44.0582, -121.3153, [NPL, NL]],
    ["Salem United", "Salem", "97301", 44.9429, -123.0351, [NL]], // unverified
    ["Southern Oregon United", "Medford", "97504", 42.3265, -122.8756, [NL]], // unverified
    ["Corvallis FC", "Corvallis", "97330", 44.5646, -123.2620, [NL]], // unverified
  ]),

  // ---------------------------- Rhode Island ----------------------------
  ...cities("RI", [
    ["FC Rhode Island", "Lincoln", "02865", 41.9200, -71.4400, [NPL, NL]], // unverified
    ["Rhode Island Surf SC", "Warwick", "02886", 41.7001, -71.4162, [NL]], // unverified
    ["Providence United", "Providence", "02908", 41.8400, -71.4300, [NL]], // unverified
    ["Ocean State United", "Cranston", "02920", 41.7798, -71.4373, [NL]], // unverified
    ["South County Soccer Club", "Wakefield", "02879", 41.4370, -71.5012, [NL]], // unverified
    ["East Bay United", "Bristol", "02809", 41.6771, -71.2662, [NL]], // unverified
    ["Newport County FC", "Middletown", "02842", 41.5157, -71.2770, [NL]], // unverified
    ["Cumberland United", "Cumberland", "02864", 41.9670, -71.4320, [NL]], // unverified
  ]),

  // ---------------------------- South Dakota ----------------------------
  ...cities("SD", [
    ["Dakota Alliance Soccer Club", "Sioux Falls", "57108", 43.4900, -96.7300, [NPL, NL]],
    ["Sioux Falls United", "Sioux Falls", "57106", 43.5300, -96.7900, [NL]], // unverified
    ["Black Hills Rapids", "Rapid City", "57702", 44.0500, -103.2700, [NL]], // unverified
    ["Brookings Soccer Club", "Brookings", "57006", 44.3114, -96.7984, [NL]], // unverified
    ["Aberdeen FC", "Aberdeen", "57401", 45.4647, -98.4865, [NL]], // unverified
    ["Watertown United", "Watertown", "57201", 44.8994, -97.1150, [NL]], // unverified
  ]),

  // ---------------------------- Utah ----------------------------
  ...cities("UT", [
    ["Real Salt Lake Academy", "Herriman", "84096", 40.5141, -112.0330, [MLSN]],
    ["La Roca FC", "South Weber", "84405", 41.1300, -111.9300, [ECNL, MLSN]],
    ["Utah Royals FC Academy", "Sandy", "84070", 40.5800, -111.8900, [ECNL]],
    ["Utah Celtic FC", "West Jordan", "84088", 40.6000, -111.9800, [ECRL, NPL]],
    ["Sparta United", "Lehi", "84043", 40.3916, -111.8508, [ECRL, NPL]],
    ["Utah Avalanche", "Draper", "84020", 40.5247, -111.8638, [ECRL, NPL]],
    ["Wasatch Soccer Club", "Salt Lake City", "84121", 40.6200, -111.8100, [ECRL, NPL]],
    ["Northern Utah United", "Ogden", "84403", 41.1900, -111.9500, [NL]], // unverified
    ["Southern Utah FC", "St. George", "84790", 37.0965, -113.5684, [NL]], // unverified
    ["Cache Valley United", "Logan", "84321", 41.7370, -111.8338, [NL]], // unverified
  ]),

  // ---------------------------- Vermont ----------------------------
  ...cities("VT", [
    ["Vermont Fusion FC", "Burlington", "05401", 44.4759, -73.2121, [NPL, NL]], // unverified
    ["Burlington United SC", "South Burlington", "05403", 44.4669, -73.1709, [NL]], // unverified
    ["Green Mountain United", "Montpelier", "05602", 44.2601, -72.5754, [NL]], // unverified
    ["Rutland FC", "Rutland", "05701", 43.6106, -72.9726, [NL]], // unverified
    ["Brattleboro Soccer Club", "Brattleboro", "05301", 42.8509, -72.5579, [NL]], // unverified
    ["St. Albans United", "St. Albans", "05478", 44.8109, -73.0832, [NL]], // unverified
  ]),

  // ---------------------------- West Virginia ----------------------------
  ...cities("WV", [
    ["Charleston Soccer Club", "Charleston", "25301", 38.3498, -81.6326, [NPL, NL]], // unverified
    ["Morgantown FC", "Morgantown", "26505", 39.6295, -79.9559, [NL]], // unverified
    ["Huntington United", "Huntington", "25701", 38.4192, -82.4452, [NL]], // unverified
    ["Teays Valley Soccer Club", "Hurricane", "25526", 38.4326, -82.0201, [NL]], // unverified
    ["Parkersburg FC", "Parkersburg", "26101", 39.2667, -81.5615, [NL]], // unverified
    ["Wheeling Soccer Club", "Wheeling", "26003", 40.0640, -80.7209, [NL]], // unverified
    ["Martinsburg United", "Martinsburg", "25401", 39.4562, -77.9639, [NL]], // unverified
    ["Beckley FC", "Beckley", "25801", 37.7782, -81.1882, [NL]], // unverified
  ]),

  // ---------------------------- Wisconsin ----------------------------
  ...cities("WI", [
    ["FC Wisconsin", "Germantown", "53022", 43.2286, -88.1104, [MLSN, ECNL]],
    ["Milwaukee Kickers Soccer Club", "Milwaukee", "53223", 43.1600, -87.9900, [ECRL, NPL]],
    ["Bavarian Soccer Club", "Milwaukee", "53209", 43.1200, -87.9500, [NPL]],
    ["FC Milwaukee Nationals", "Milwaukee", "53207", 42.9700, -87.9000, [NPL, NL]],
    ["Madison 56ers", "Madison", "53711", 43.0300, -89.4500, [ECRL, NPL]],
    ["Rush Wisconsin", "Madison", "53718", 43.1000, -89.2700, [ECRL, NPL]],
    ["SC Wave", "Waukesha", "53186", 43.0117, -88.2315, [ECRL, NPL]],
    ["Green Bay United", "Green Bay", "54301", 44.4900, -88.0100, [NL]], // unverified
    ["Appleton United", "Appleton", "54914", 44.2700, -88.4400, [NL]], // unverified
    ["Eau Claire FC", "Eau Claire", "54701", 44.7700, -91.4800, [NL]], // unverified
  ]),

  // ---------------------------- Wyoming ----------------------------
  ...cities("WY", [
    ["Cheyenne Soccer Club", "Cheyenne", "82001", 41.1400, -104.8202, [NL]], // unverified
    ["Casper United", "Casper", "82601", 42.8666, -106.3131, [NL]], // unverified
    ["Laramie Soccer Club", "Laramie", "82070", 41.3114, -105.5911, [NL]], // unverified
    ["Jackson Hole FC", "Jackson", "83001", 43.4799, -110.7624, [NL]], // unverified
    ["Sheridan FC", "Sheridan", "82801", 44.7972, -106.9562, [NL]], // unverified
    ["Gillette United", "Gillette", "82716", 44.2911, -105.5022, [NL]], // unverified
  ]),
];
