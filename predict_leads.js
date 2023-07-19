const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.PREDICT_LEADS_API_KEY
const apiToken = process.env.PREDICT_LEADS_API_TOKEN

const followCompany = async (companyDomain) => {
    try {
        const followUrl = `https://predictleads.com/api/v2/companies/${companyDomain}/follow`;

        const response = await axios.post(followUrl, {}, {
            headers: {
                'X-Api-Key': apiKey,
                'X-Api-Token': apiToken
            }
        });

        console.log(response.data.success.message);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getTechnologies = async (companyDomain) => {
    try {
        const technologiesUrl = `https://predictleads.com/api/v2/companies/${companyDomain}/technologies`;

        const response = await axios.get(technologiesUrl, {
            headers: {
                'X-Api-Key': apiKey,
                'X-Api-Token': apiToken
            },
            params: {
                categories: 'Data Storage,Data Warehousing,Data Management,Data Integration,Big Data Processing,Database,Database Management,Database Management Software,Cloud Infrastructure Computing,Enterprise Data Storage,Data Quality Management',
                score: 0,
                limit: 100
            }
        });

        const technologies = {};

        response.data.data.forEach((technology) => {
            const title = technology.attributes.title;
            const sources = [];

            // Extract sources from job_openings
            const jobOpenings = response.data.included.filter((item) => item.type === 'job_opening');
            jobOpenings.forEach((jobOpening) => {
                if (technology.relationships.seen_on_job_openings.data.find((data) => data.id === jobOpening.id)) {
                    sources.push({
                        type: 'job_opening',
                        url: jobOpening.attributes.url,
                        firstSeenAt: jobOpening.attributes.first_seen_at,
                        lastSeenAt: jobOpening.attributes.last_seen_at
                    });
                }
            });

            // Extract sources from subpages
            const subpages = response.data.included.filter((item) => item.type === 'subpage');
            subpages.forEach((subpage) => {
                if (technology.relationships.seen_on_subpages.data.find((data) => data.id === subpage.id)) {
                    sources.push({
                        type: 'subpage',
                        url: subpage.attributes.url,
                        firstSeenAt: subpage.attributes.first_seen_at,
                        lastSeenAt: subpage.attributes.last_seen_at
                    });
                }
            });

            technologies[title] = sources;
        });

        return technologies;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


module.exports = { followCompany, getTechnologies };