/* ------------------------------------------------------------------ *
 *  National expansion seed: 30 clubs each in Texas, Georgia, North
 *  Carolina, South Carolina and Tennessee. Like the Florida seed, these
 *  are unclaimed, unrated directory entries with no contact details —
 *  programs fill those in when they claim the profile. Coordinates are
 *  city-level (good enough for the ZIP radius filter and "nearby" clubs).
 *  Founding years and websites are left blank on purpose rather than guessed.
 * ------------------------------------------------------------------ */

export interface NationalRawClub {
  name: string;
  state: string; // two-letter code
  region: string; // full region key, e.g. "tx-dfw"
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
];
