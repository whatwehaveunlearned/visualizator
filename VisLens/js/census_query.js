var DEFAULT_KEY = "f5fde1977efdac0830bffebf28f5d4a325e6d78d";
var state_to_num = {
		"Alabama": "01",
		"Alaska": "02",
		"Arizona": "04",
		"Arkansas": "05",
		"California": "06",
		"Colorado": "08",
		"Connecticut": "09",
		"Delaware": "10",
		"District of Columbia": "11",
		"Florida": "12",
		"Georgia": "13",
		"Hawaii": "15",
		"Idaho": "16",
		"Illinois": "17",
		"Indiana": "18",
		"Iowa": "19",
		"Kansas": "20",
		"Kentucky": "21",
		"Louisiana": "22",
		"Maine": "23",
		"Maryland": "24",
		"Massachusetts": "25",
		"Michigan": "26",
		"Minnesota": "27",
		"Mississippi": "28",
		"Missouri": "29",
		"Montana": "30",
		"Nebraska": "31",
		"Nevada": "32",
		"New Hampshire": "33",
		"New Jersey": "34",
		"New Mexico": "35",
		"New York": "36",
		"North Carolina": "37",
		"North Dakota": "38",
		"Ohio": "39",
		"Oklahoma": "40",
		"Oregon": "41",
		"Pennsylvania": "42",
		"Rhode Island": "44",
		"South Carolina": "45",
		"South Dakota": "46",
		"Tennessee": "47",
		"Texas": "48",
		"Utah": "49",
		"Vermont": "50",
		"Virginia": "51",
		"Washington": "53",
		"West Virginia": "54",
		"Wisconsin": "55",
		"Wyoming": "56",
		"Puerto Rico": "72"
}
var state_to_num_abbr = {
		"AL": "01",
		"AK": "02",
		"AZ": "04",
		"AR": "05",
		"CA": "06",
		"CO": "08",
		"CT": "09",
		"DE": "10",
		"DC": "11",
		"FL": "12",
		"GA": "13",
		"HI": "15",
		"ID": "16",
		"IL": "17",
		"IN": "18",
		"IA": "19",
		"KS": "20",
		"KY": "21",
		"LA": "22",
		"ME": "23",
		"MD": "24",
		"MA": "25",
		"MI": "26",
		"MN": "27",
		"MS": "28",
		"MO": "29",
		"MT": "30",
		"NE": "31",
		"NV": "32",
		"NH": "33",
		"NJ": "34",
		"NM": "35",
		"NY": "36",
		"NC": "37",
		"ND": "38",
		"OH": "39",
		"OK": "40",
		"OR": "41",
		"PA": "42",
		"RI": "44",
		"SC": "45",
		"SD": "46",
		"TN": "47",
		"TX": "48",
		"UT": "49",
		"VT": "50",
		"VA": "51",
		"WA": "53",
		"WV": "54",
		"WI": "55",
		"WY": "56",
		"PR": "72"
}
var num_to_state = null;
var num_to_state_abbr = null;

function CensusQuery(key)
{
	this.key = (key === undefined || key === null) ? DEFAULT_KEY : key;
	if (num_to_state === null)
	{
		num_to_state = {};
		for (var state in state_to_num)
			num_to_state[ state_to_num[state] ] = state;
		num_to_state_abbr = {};
		for (var state in state_to_num_abbr)
			num_to_state_abbr[ state_to_num_abbr[state] ] = state;
	}
}

CensusQuery.prototype.getStateNumber = function(state)
{
	if (state.length == 2)
	{
		return state_to_num_abbr[state.toUpperCase(state)];
	}
	else
	{
		return state_to_num[state.capitalize().replace("Of", "of")];
	}
}


CensusQuery.prototype.getCounties = function(callback, variables, state, county)
{
	// apend NAME to list of variables
	variables.push("NAME");

	// construct query string
	var query = "http://api.census.gov/data/2010/sf1?key=" + this.key;
	var varCount = variables.length;

	query = query + "&get="
	for (var i=0; i < varCount; i++)
	{
		query = query + variables;
		if (i != varCount-1)
			query = query + ",";
	}

	query = query + "&for=county:" + (county ? county : "*");
	if (state !== null && state !== undefined)
		query = query + "&in=state:" + this.getStateNumber(state);

	// get and parse the JSON file
	d3.json(query, function(error, data)
	{
		if (error) { 
			return console.warn(error); 
		}
		else
		{
			var json = [];
			var actualVars = data[0];
			var varCount = actualVars.length;

			var stateI = -1;
			for (var j = 0; j < varCount; j++) {
				if (actualVars[j] == "state") {
					stateI = j;
					break;
				}
			}

			for (var i = 1, len = data.length; i < len; i++)
			{
				var obj = {};
				var d = data[i];
				for (var j = 0; j < varCount; j++)
				{
					if (stateI == j)
					{
						obj.state = num_to_state[ d[j] ];
						obj.state_abbr = num_to_state_abbr[ d[j] ];
						obj.state_num = d[j];
					}
					else
						obj[ actualVars[j] ] =  d[j];
				}
				json.push(obj);
			}
			callback(json);
		}

	});
}
