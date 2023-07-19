const { WebClient } = require('@slack/web-api');

const web = new WebClient(process.env.SLACK_TOKEN);

const sendAlert = async (channel, companyName, contactList, salesforceUrl, technologies) => {
    // let attachments = [];

    // contactList.forEach((contact, index) => {
    //     attachments.push({
    //         color: "#36a64f",
    //         fields: [
    //             {
    //                 title: `${index + 1}. ${contact.Name}`,
    //                 value: `Email: ${contact.email}`,
    //                 short: false
    //             }
    //         ]
    //     });
    // });

    let message = `Koala visitor from *${companyName}*. ${
        contactList.length
    } contacts created in Salesforce. <${salesforceUrl}|View in Salesforce>`;

    // Append technologies information to the message
    const technologyTitles = Object.keys(technologies);
    if (technologyTitles.length > 0) {
        const technologyText = `*Technologies used*: ${technologyTitles.join(', ')}`;
        message += `\n\n${technologyText}`;
    }

    await web.chat.postMessage({
        channel,
        text: message,
        // attachments,
    });
};

module.exports = { sendAlert };