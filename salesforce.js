const jsforce = require('jsforce');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');
require('dotenv').config();

// Load the private key
const privateKey = fs.readFileSync(path.resolve(process.env.PRIVATE_KEY_PATH));

// Construct the JWT
const token = jwt.sign({
    // issued at time
    "iat": Math.floor(Date.now() / 1000),
    // JWT expiration time (10 minute maximum)
    "exp": Math.floor(Date.now() / 1000) + (10 * 60),
    // issuer
    "iss": process.env.SALESFORCE_CLIENT_ID,
    // audience
    "aud": 'https://login.salesforce.com',
    // subject
    "sub": process.env.SALESFORCE_USERNAME,
    // JWT ID
    "jti": Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}, privateKey, { algorithm: 'RS256' });

console.log('JWT constructed successfully');

// Use jsforce's oauth2 services to get an access token
const oauth2 = new jsforce.OAuth2({
    loginUrl: 'https://login.salesforce.com',
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET
});

console.log('Starting authentication');


const options = {
    url: `${oauth2.loginUrl}/services/oauth2/token`,
    method: 'POST',
    form: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    }
};

let conn;

const authenticate = async () => {
    try {
        console.log('Starting authentication');
        const response = await request(options);
        console.log('Authentication successful');
        const userInfo = JSON.parse(response);

        conn = new jsforce.Connection({
            instanceUrl: userInfo.instance_url,
            accessToken: userInfo.access_token
        });

        return conn; // Return the connection object

    } catch (error) {
        console.error('Error during authentication:', error);
        throw error;
    }
};


// Function to find a company in Salesforce
const findCompany = async (companyName) => {
    try {
        let result = await conn.query(`SELECT Id, Name FROM Account WHERE Name='${companyName}'`);
        return result.records;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to find contacts for a company in Salesforce
const findContacts = async (companyId) => {
    try {
        let result = await conn.query(`SELECT Id, Name FROM Contact WHERE AccountId='${companyId}'`);
        return result.records;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to create a company in Salesforce,
const createCompany = async (companyName, companyDomain) => {
    try {
        let account = {
            Name: companyName,
            Website: companyDomain
        };
        let result = await conn.sobject("Account").create(account);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to create a contact in Salesforce
const createContact = async (contactData, companyId) => {
    try {
        let contact = {
            AccountId: companyId,
            FirstName: contactData.firstName,
            LastName: contactData.lastName ? contactData.lastName : contactData.firstName,
            Title: contactData.title,
            Email: contactData.email,
            LinkedIn_Profile_URL__c: contactData.linkedin_url
        };
        let result = await conn.sobject("Contact").create(contact);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to update a company in Salesforce
const updateCompany = async (companyId, description) => {
    try {
        let account = {
            Id: companyId,
            Description: description
        };
        let result = await conn.sobject("Account").update(account);
        console.log("Update Result", result)
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = { authenticate, findCompany, findContacts, createCompany, createContact, updateCompany };
