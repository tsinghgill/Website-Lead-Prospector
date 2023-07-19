# Website Prospector

Website Prospector is a project that helps collect and analyze data from company websites. It integrates with Salesforce, a sales and customer relationship management platform, as well as other external services such as Predict Leads and Slack. The main file of the project is `server.js`.

## Installation

To use Website Prospector, please follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Set up the necessary environment variables. Create a `.env` file in the root directory and add the following variables:
   - `SALESFORCE_CLIENT_ID`: Your Salesforce connected app client ID.
   - `SALESFORCE_CLIENT_SECRET`: Your Salesforce connected app client secret.
   - `SALESFORCE_USERNAME`: Your Salesforce username.
   - `PRIVATE_KEY_PATH`: The path to your private key file.
   - `PREDICT_LEADS_API_KEY`: Your Predict Leads API key.
   - `PREDICT_LEADS_API_TOKEN`: Your Predict Leads API token.
   - `SLACK_TOKEN`: Your Slack bot token.

**Note:** The private key file and certificate for Salesforce authentication should be generated using OpenSSL. The private key should be provided in PEM format and stored in a secure location. Update the `PRIVATE_KEY_PATH` environment variable with the path to this file.

## Salesforce Authentication

Website Prospector uses JWT (JSON Web Token) for authentication with Salesforce. JWT allows secure communication between two parties by generating a digitally signed token. To authenticate with Salesforce, the following steps are taken:

1. Generate a private key and certificate using OpenSSL.
2. Store the private key in the secure location and update the `PRIVATE_KEY_PATH` environment variable with the path to this file.
3. Configure a connected app in Salesforce, and obtain the client ID and client secret.
4. Set the `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, and `SALESFORCE_USERNAME` environment variables.
5. Construct a JWT using the private key, client ID, username, and other necessary information.
6. Send a request to Salesforce to obtain an access token using the JWT.
7. Use the access token to authenticate the requests made to the Salesforce API.

For more information on Salesforce JWT authentication, refer to the Salesforce documentation.

## External API Keys

Website Prospector requires API keys for Predict Leads and Apollo. These API keys can be obtained from 1Password or from the respective services. Update the `PREDICT_LEADS_API_KEY` and `PREDICT_LEADS_API_TOKEN` environment variables with the corresponding values for Predict Leads.

## Usage

To run Website Prospector locally, follow these steps:

1. Start the server by running `node server.js`. The server will run on port 3000 by default.
2. Set up a webhook for Salesforce. In your Salesforce connected app settings, configure the webhook URL to `http://localhost:3000/koala-webhook`. This webhook is used to receive notifications from Salesforce.
3. Set up a webhook for Predict Leads. Configure the webhook URL to `http://localhost:3000/predict-leads-webhook`. This webhook is used to receive notifications from Predict Leads.
4. Start ngrok (or any other tunneling service) and point it to port 3000. This will allow Salesforce and Predict Leads to send webhooks to your local server.
5. Update the connected app settings in Salesforce and Predict Leads with the ngrok URL.
6. Test the functionality by triggering events in Salesforce or Predict Leads that should trigger the webhooks.

## Project Structure

- `server.js`: The main file of the project, responsible for setting up the server and handling incoming webhook requests.
- `salesforce.js`: Contains functions for authenticating with Salesforce and interacting with Salesforce objects such as accounts and contacts.
- `apollo.js`: Contains functions for retrieving contact data from the Apollo API based on a company domain.
- `slack.js`: Contains functions for sending alerts to a Slack channel.
- `predict_leads.js`: Contains functions for interacting with the Predict Leads API, including following a company and retrieving technologies used by a company.

## Dependencies

Website Prospector relies on the following dependencies:
- `express`: A web framework for Node.js used to set up the server.
- `body-parser`: A middleware for parsing JSON request bodies.
- `jsforce`: A Salesforce API integration library for Node.js.
- `jsonwebtoken`: A library for creating and verifying JSON Web Tokens (JWT).
- `axios`: A Promise-based HTTP client for making API requests.
- `@slack/web-api`: A library for interacting with the Slack Web API.
- `request-promise`: A library for making HTTP requests with promises.

## Contributions

Contributions to this project are welcome. Please submit any bug reports, feature requests, or pull requests to the GitHub repository.
