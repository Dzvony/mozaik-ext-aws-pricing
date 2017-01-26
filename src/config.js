// require('dotenv').load();
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
            doc:     'Identifier of user\'s AWS account. 12 digits.',
            default: '',
            format:  String,
            env:     'AWS_ACCOUNT_ID'
        },
        s3bucket: {
            doc:     'AWS S3 bucket name',
            default: '',
            format:  String,
            env:     'AWS_S3_BUCKET'
        },
        s3keyMonthByService: {
            doc:     'AWS S3 key of report',
            default: '',
            format:  String,
            env:     'AWS_S3_KEY_MONTH_BY_SERVICE'
        },
        // default will be one hour in milliseconds
        s3pollInterval: {
            doc:     'AWS amount of miliseconds to check',
            default: 3600000,
            format:  Number,
            env:     'AWS_S3_POLL_INTERVAL'
        },
    }
});


export default config;
