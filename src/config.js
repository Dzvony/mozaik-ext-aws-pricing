import convict from 'convict';

const config = convict({
    aws: {
        region: {
            doc:     'The AWS region.',
            default: 'eu-west-1',
            format:  String,
            env:     'AWS_REGION'
        },
        accountID: {
            doc:     'Identifier of user account. 12 digits.',
            default: null,
            format:  String,
            env:     'AWS_ACCOUNT_ID'
        }
    }
});


export default config;
