require('dotenv').load();
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
        },
        s3bucket: {
            doc:     'AWS S3 bucket name',
            default: null,
            format:  String,
            env:     'AWS_S3_BUCKET'
        },
        s3keyMonthByService: {
            doc:     'AWS S3 key of report',
            default: null,
            format:  String,
            env:     'AWS_S3_KEY_MONTH_BY_SERVICE'
        }
    }
});


export default config;
