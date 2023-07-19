const express = require('express');
const bodyParser = require('body-parser');
const salesforce = require('./salesforce');
const apollo = require('./apollo');
const slack = require('./slack');
const predictLeads = require('./predict_leads');

const app = express();
app.use(bodyParser.json());

app.post('/koala-webhook', async (req, res) => {
    try {
        await koalaWebhook(req.body);
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

const koalaWebhook = async (data) => {
    // Authenticate with Salesforce
    await salesforce.authenticate();

    const webhookData = data[0].notification.ctx;

    const companyName = webhookData.account.name;
    const companyDomain = webhookData.account.domain;
    console.log(companyName)
    console.log(companyDomain)

    // Follow company in Predict Leads
    try {
        await predictLeads.followCompany(companyDomain);
    } catch (error) {
        console.error('Error following company in Predict Leads:', error);
        // Handle the error gracefully
        // For example, you can return an error response or throw a custom error
    }

    let companyList;
    try {
        companyList = await salesforce.findCompany(companyName, companyDomain);
    } catch (error) {
        console.error('Error finding company in Salesforce:', error);
        // Handle the error gracefully
        // For example, you can return an error response or throw a custom error
    }

    // If the company doesn't exist in Salesforce, create a new one
    if (companyList.length === 0) {
        console.log(`Company ${companyName} not found in Salesforce, creating new company.`);
        const newCompany = await salesforce.createCompany(companyName, companyDomain);
        companyId = newCompany.id;
    } else {
        companyId = companyList[0].Id;
        console.log(`Company ${companyName} found in Salesforce.`);
    }

    // Get the Salesforce URL for the company
    const salesforceUrl = `${process.env.SALESFORCE_INSTANCE_URL}/${companyId}`;

    // Fetch technologies from Predict Leads
    // Add technologies to Salesforce
    let technologies
    try {
        technologies = await predictLeads.getTechnologies(companyDomain);
        console.log(`Got technologies: `, JSON.stringify(technologies));

        const technologyTitles = Object.keys(technologies);
        if (technologyTitles.length > 0) {
            const technologyText = `*Technologies used*: ${technologyTitles.join(', ')}`;
            await salesforce.updateCompany(companyId, technologyText);
        }
    } catch (error) {
        console.error('Error fetching technologies from Predict Leads:', error);
        // Handle the error gracefully
        // For example, you can return an error response or throw a custom error
    }

    // Find contacts in Salesforce
    let contactList;
    try {
        contactList = await salesforce.findContacts(companyId);
    } catch (error) {
        console.error(`Error finding contacts in Salesforce:`, error);
        // Handle the error gracefully
        // For example, you can return an error response or throw a custom error
    }

    // If the company has no contacts in Salesforce, fetch contact data from the Apollo API and create new contacts
    if (contactList.length === 0) {
        console.log(`No contacts found for company ${companyName}, creating new contacts.`);

        // Fetch contacts from Apollo API
        const apolloContacts = await apollo.getContacts(companyDomain);
        for (const contact of apolloContacts) {
            try {
                await salesforce.createContact(contact, companyId);
            } catch (error) {
                console.error(`Error creating contact in Salesforce:`, error);
                // Handle the error gracefully
                // For example, you can return an error response or throw a custom error
            }
        }

        try {
            contactList = await salesforce.findContacts(companyId);
        } catch (error) {
            console.error(`Error finding newly created contacts in Salesforce:`, error);
            // Handle the error gracefully
            // For example, you can return an error response or throw a custom error
        }

    }

    // Sending Slack alert
    const slackChannel = '#bag-getters';
    // await slack.sendAlert(slackChannel, companyName, contactList, salesforceUrl, technologies);

    console.log(`Successfully handled webhook for ${companyName}.`);
};

app.post('/predict-leads-webhook', async (req, res) => {
    try {
        await predictLeadsWebhook(req.body);
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

const predictLeadsWebhook = async (data) => {
    // Authenticate with Salesforce
    await salesforce.authenticate();

    // Code for handling the webhook data

    // Find company
    let companyList;
    try {
        companyList = await salesforce.findCompany(companyName, companyDomain);
    } catch (error) {
        console.error('Error finding company in Salesforce:', error);
        // Handle the error gracefully
        // For example, you can return an error response or throw a custom error
    }

    // Fetch buying intent from Salesforce
    // Add buying intent to Salesforce

    // Sending Slack alert
    // const slackChannel = '#bag-getters';
    // await slack.sendAlert(slackChannel, companyName, contactList, salesforceUrl, technologies);


    console.log(`Successfully handled webhook for predict leads.`);
};


app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app;