const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-watson/auth');

let client;

const connectDB = async () => {
    try {
        const authenticator = new IamAuthenticator({
            apikey: process.env.CLOUDANT_API_KEY
        });

        client = CloudantV1.newInstance({
            authenticator: authenticator
        });

        await client.getDatabaseInformation({
            db: process.env.CLOUDANT_DB_NAME
        });

        console.log('Connected to Cloudant DB');
        return client;
    } catch (error) {
        console.error('Cloudant DB Connection Error:', error);
        process.exit(1);
    }
};

const getDB = () => client;

module.exports = {
    connectDB,
    getDB
};
