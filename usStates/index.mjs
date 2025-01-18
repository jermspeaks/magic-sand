import fs from 'fs/promises';
import path from 'path';

const statesData = [
    {
        name: 'Alabama',
        abbreviation: 'AL',
        capital: 'Montgomery',
        population: 5.1,
        stateBird: 'Northern Flicker (Yellowhammer)',
        statehood: '1819-12-14'
    },
    {
        name: 'Alaska',
        abbreviation: 'AK',
        capital: 'Juneau',
        population: 0.73,
        stateBird: 'Willow Ptarmigan',
        statehood: '1959-01-03'
    },
    {
        name: 'Arizona',
        abbreviation: 'AZ', 
        capital: 'Phoenix',
        population: 7.4,
        stateBird: 'Cactus Wren',
        statehood: '1912-02-14'
    },
    {
        name: 'Arkansas',
        abbreviation: 'AR',
        capital: 'Little Rock', 
        population: 3.0,
        stateBird: 'Northern Mockingbird',
        statehood: '1836-06-15'
    },
    {
        name: 'California',
        abbreviation: 'CA',
        capital: 'Sacramento',
        population: 39.2,
        stateBird: 'California Valley Quail',
        statehood: '1850-09-09'
    },
    {
        name: 'Colorado',
        abbreviation: 'CO',
        capital: 'Denver',
        population: 5.8,
        stateBird: 'Lark Bunting',
        statehood: '1876-08-01'
    },
    {
        name: 'Connecticut',
        abbreviation: 'CT',
        capital: 'Hartford',
        population: 3.6,
        stateBird: 'American Robin',
        statehood: '1788-01-09'
    },
    {
        name: 'Delaware',
        abbreviation: 'DE',
        capital: 'Dover',
        population: 1.0,
        stateBird: 'Blue Hen Chicken',
        statehood: '1787-12-07'
    },
    {
        name: 'Florida',
        abbreviation: 'FL',
        capital: 'Tallahassee',
        population: 21.9,
        stateBird: 'Northern Mockingbird',
        statehood: '1845-03-03'
    },
    {
        name: 'Georgia',
        abbreviation: 'GA',
        capital: 'Atlanta',
        population: 10.7,
        stateBird: 'Brown Thrasher',
        statehood: '1788-01-02'
    },
    {
        name: 'Hawaii',
        abbreviation: 'HI',
        capital: 'Honolulu',
        population: 1.4,
        stateBird: 'Nene',
        statehood: '1959-08-21'
    },
    {
        name: 'Idaho',
        abbreviation: 'ID',
        capital: 'Boise',
        population: 1.9,
        stateBird: 'Mountain Bluebird',
        statehood: '1890-07-03'
    },
    {
        name: 'Illinois',
        abbreviation: 'IL',
        capital: 'Springfield',
        population: 12.7,
        stateBird: 'Northern Cardinal',
        statehood: '1818-12-03'
    },
    {
        name: 'Indiana',
        abbreviation: 'IN',
        capital: 'Indianapolis',
        population: 6.8,
        stateBird: 'Northern Cardinal',
        statehood: '1816-12-11'
    },
    {
        name: 'Iowa',
        abbreviation: 'IA',
        capital: 'Des Moines',
        population: 3.2,
        stateBird: 'American Goldfinch',
        statehood: '1846-12-28'
    },
    {
        name: 'Kansas',
        abbreviation: 'KS',
        capital: 'Topeka',
        population: 2.9,
        stateBird: 'Western Meadowlark',
        statehood: '1861-01-29'
    },
    {
        name: 'Kentucky',
        abbreviation: 'KY',
        capital: 'Frankfort',
        population: 4.5,
        stateBird: 'Northern Cardinal',
        statehood: '1792-06-01'
    },
    {
        name: 'Louisiana',
        abbreviation: 'LA',
        capital: 'Baton Rouge',
        population: 4.6,
        stateBird: 'Brown Pelican',
        statehood: '1812-04-30'
    },
    {
        name: 'Maine',
        abbreviation: 'ME',
        capital: 'Augusta',
        population: 1.4,
        stateBird: 'Black-capped Chickadee',
        statehood: '1820-03-15'
    },
    {
        name: 'Maryland',
        abbreviation: 'MD',
        capital: 'Annapolis',
        population: 6.2,
        stateBird: 'Baltimore Oriole',
        statehood: '1788-04-28'
    },
    {
        name: 'Massachusetts',
        abbreviation: 'MA',
        capital: 'Boston',
        population: 7.0,
        stateBird: 'Black-capped Chickadee',
        statehood: '1788-02-06'
    },
    {
        name: 'Michigan',
        abbreviation: 'MI',
        capital: 'Lansing',
        population: 10.0,
        stateBird: 'American Robin',
        statehood: '1837-01-26'
    },
    {
        name: 'Minnesota',
        abbreviation: 'MN',
        capital: 'St. Paul',
        population: 5.7,
        stateBird: 'Common Loon',
        statehood: '1858-05-11'
    },
    {
        name: 'Mississippi',
        abbreviation: 'MS',
        capital: 'Jackson',
        population: 3.0,
        stateBird: 'Northern Mockingbird',
        statehood: '1817-12-10'
    },
    {
        name: 'Missouri',
        abbreviation: 'MO',
        capital: 'Jefferson City',
        population: 6.2,
        stateBird: 'Eastern Bluebird',
        statehood: '1821-08-10'
    },
    {
        name: 'Montana',
        abbreviation: 'MT',
        capital: 'Helena',
        population: 1.1,
        stateBird: 'Western Meadowlark',
        statehood: '1889-11-08'
    },
    {
        name: 'Nebraska',
        abbreviation: 'NE',
        capital: 'Lincoln',
        population: 2.0,
        stateBird: 'Western Meadowlark',
        statehood: '1867-03-01'
    },
    {
        name: 'Nevada',
        abbreviation: 'NV',
        capital: 'Carson City',
        population: 3.1,
        stateBird: 'Mountain Bluebird',
        statehood: '1864-10-31'
    },
    {
        name: 'New Hampshire',
        abbreviation: 'NH',
        capital: 'Concord',
        population: 1.4,
        stateBird: 'Purple Finch',
        statehood: '1788-06-21'
    },
    {
        name: 'New Jersey',
        abbreviation: 'NJ',
        capital: 'Trenton',
        population: 9.3,
        stateBird: 'American Goldfinch',
        statehood: '1787-12-18'
    },
    {
        name: 'New Mexico',
        abbreviation: 'NM',
        capital: 'Santa Fe',
        population: 2.1,
        stateBird: 'Greater Roadrunner',
        statehood: '1912-01-06'
    },
    {
        name: 'New York',
        abbreviation: 'NY',
        capital: 'Albany',
        population: 20.2,
        stateBird: 'Eastern Bluebird',
        statehood: '1788-07-26'
    },
    {
        name: 'North Carolina',
        abbreviation: 'NC',
        capital: 'Raleigh',
        population: 10.6,
        stateBird: 'Northern Cardinal',
        statehood: '1789-11-21'
    },
    {
        name: 'North Dakota',
        abbreviation: 'ND',
        capital: 'Bismarck',
        population: 0.77,
        stateBird: 'Western Meadowlark',
        statehood: '1889-11-02'
    },
    {
        name: 'Ohio',
        abbreviation: 'OH',
        capital: 'Columbus',
        population: 11.8,
        stateBird: 'Northern Cardinal',
        statehood: '1803-03-01'
    },
    {
        name: 'Oklahoma',
        abbreviation: 'OK',
        capital: 'Oklahoma City',
        population: 4.0,
        stateBird: 'Scissor-tailed Flycatcher',
        statehood: '1907-11-16'
    },
    {
        name: 'Oregon',
        abbreviation: 'OR',
        capital: 'Salem',
        population: 4.2,
        stateBird: 'Western Meadowlark',
        statehood: '1859-02-14'
    },
    {
        name: 'Pennsylvania',
        abbreviation: 'PA',
        capital: 'Harrisburg',
        population: 13.0,
        stateBird: 'Ruffed Grouse',
        statehood: '1787-12-12'
    },
    {
        name: 'Rhode Island',
        abbreviation: 'RI',
        capital: 'Providence',
        population: 1.1,
        stateBird: 'Rhode Island Red Chicken',
        statehood: '1790-05-29'
    },
    {
        name: 'South Carolina',
        abbreviation: 'SC',
        capital: 'Columbia',
        population: 5.1,
        stateBird: 'Carolina Wren',
        statehood: '1788-05-23'
    },
    {
        name: 'South Dakota',
        abbreviation: 'SD',
        capital: 'Pierre',
        population: 0.89,
        stateBird: 'Ring-necked Pheasant',
        statehood: '1889-11-02'
    },
    {
        name: 'Tennessee',
        abbreviation: 'TN',
        capital: 'Nashville',
        population: 6.9,
        stateBird: 'Northern Mockingbird',
        statehood: '1796-06-01'
    },
    {
        name: 'Texas',
        abbreviation: 'TX',
        capital: 'Austin',
        population: 29.5,
        stateBird: 'Northern Mockingbird',
        statehood: '1845-12-29'
    },
    {
        name: 'Utah',
        abbreviation: 'UT',
        capital: 'Salt Lake City',
        population: 3.3,
        stateBird: 'California Gull',
        statehood: '1896-01-04'
    },
    {
        name: 'Vermont',
        abbreviation: 'VT',
        capital: 'Montpelier',
        population: 0.64,
        stateBird: 'Hermit Thrush',
        statehood: '1791-03-04'
    },
    {
        name: 'Virginia',
        abbreviation: 'VA',
        capital: 'Richmond',
        population: 8.6,
        stateBird: 'Northern Cardinal',
        statehood: '1788-06-25'
    },
    {
        name: 'Washington',
        abbreviation: 'WA',
        capital: 'Olympia',
        population: 7.7,
        stateBird: 'American Goldfinch',
        statehood: '1889-11-11'
    },
    {
        name: 'West Virginia',
        abbreviation: 'WV',
        capital: 'Charleston',
        population: 1.8,
        stateBird: 'Northern Cardinal',
        statehood: '1863-06-20'
    },
    {
        name: 'Wisconsin',
        abbreviation: 'WI',
        capital: 'Madison',
        population: 5.9,
        stateBird: 'American Robin',
        statehood: '1848-05-29'
    },
    {
        name: 'Wyoming',
        abbreviation: 'WY',
        capital: 'Cheyenne',
        population: 0.58,
        stateBird: 'Western Meadowlark',
        statehood: '1890-07-10'
    }
];

async function generateStateFiles() {
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'states');
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    for (const state of statesData) {
        const frontmatter = `---
tags:
  - note/reference
  - "#map/view"
up:
  - "[[US States]]"
related: 
in:
  - "[[US States]]"
  - "[[Collections]]"
stateAbbreviation: ${state.abbreviation}
created: 2025-01-17
capital: ${state.capital}
population: ${state.population}
stateBird: ${state.stateBird}
statehood: ${state.statehood}
---

# ${state.name}

### Places

This note collects all notes where the \`in\` property says \`${state.name}\`.

\`\`\`dataview
TABLE WITHOUT ID
	file.link as Place,
	file.mtime as "Last Modified"
WHERE
	contains(in,this.file.link) and
	!contains(file.name, "Template")
SORT rank desc, year asc
LIMIT 100
\`\`\`
`;

        const fileName = `${state.name}.md`;
        const filePath = path.join(outputDir, fileName);
        
        try {
            await fs.writeFile(filePath, frontmatter);
            console.log(`Generated ${fileName}`);
        } catch (err) {
            console.error(`Error generating ${fileName}:`, err);
        }
    }
}

generateStateFiles().catch(console.error);
