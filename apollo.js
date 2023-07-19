const axios = require('axios');
require('dotenv').config();

const search_titles = [
    "Director of Procurement",
    "Head of Procurement",
    "Head of Purchasing",
    "Director of Data",
    "Data Director",
    "CTO",
    "Chief Technology Officer",
    "CFO",
    "Chief Financial Officer",
    "CIO",
    "Chief Investment Officer",
    "Chief Architect",
    "Chief Data Officer",
    "Chief Analytics Officer",
    "Head of Data",
    "VP Eng",
    "Vice President Eng",
    "Vice President Engineer",
    "Head of Data Engineering",
]

const getContacts = async (companyDomain) => {
    try {
        const response = await axios.post("https://api.apollo.io/v1/mixed_people/search", {
            api_key: process.env.APOLLO_API_KEY,
            q_organization_domains: companyDomain,
            page: 1,
            person_titles: search_titles
        }, {
            headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" }
        });

        if (!response.data || !response.data.people) {
            console.error('[getContacts Error] Unexpected response', response.data);
            return [];
        }

        console.log('[getContacts Succ] response.data.people.length', response.data.people.length);
        return response.data.people.map(({ id, first_name, last_name, name, title, email, linkedin_url, organization }) => ({
            id,
            firstName: first_name,
            lastName: last_name,
            name,
            title,
            email,
            linkedin_url,
            companyName: organization && organization.name ? organization.name : companyDomain,
            companyDomain: organization && organization.website_url ? organization.website_url : companyDomain
        }));
    } catch (error) {
        console.error('[getContacts Error]', error);
        // It might be sensible to re-throw the error if the calling code needs to handle these errors specifically
        throw error;
    }
};

module.exports = { getContacts };