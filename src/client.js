import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';

var AWS = require('aws-sdk');
const csv = require('csvtojson');
const fs  = require('fs');

const client = mozaik => {

    mozaik.loadApiConfig(config);

    const apiMethods = {
        // component development abandoned
        // this service does not work with AWS linked accounts
        budgets() {
            AWS.config.update({ region: config.get('aws.region') });    // necessary only for some services (maybe not budgets)

            // worked even without this
            AWS.config.setPromisesDependency(require('bluebird'));      // unnecessary ?

            const awsBudgets = new AWS.Budgets({apiVersion: '2016-10-20'});

            const accId = config.get('aws.accountID');

            const params = {
                AccountId:  accId, /* required */
                MaxResults: 10
                // NextToken:  'STRING_VALUE'   // not required
            };

            return awsBudgets.describeBudgets(params).promise()
            .then(
                budgets => {
                    mozaik.logger.info(chalk.yellow(`[aws] budgets fetched successfully`));
                    return budgets
                },
                error => { 
                    if (error.message)
                        mozaik.logger.error(chalk.red(`${JSON.stringify(error.message)}`)); 
                    return Promise.reject(error);
                }
            );
        },

        csvReportMonths() {
            mozaik.logger.info(chalk.yellow(`[aws] processing csvReportMonths`));

            const path = config.get('aws.sourcePath');
            const def = Promise.defer();
            let costs = {};

            csv().fromStream(fs.createReadStream(path))
            .on('json', (jsonObj, rowIndex) => {
                costs[`${rowIndex}`] = jsonObj;
            })
            .on('error', err => {
                console.log(`err ${err}`);
                def.reject(err);
            })
            .on('done', error => {
                if(error)
                    return def.reject(error);
                def.resolve(costs);
            });

            return def.promise;
        }
    };

    return apiMethods;

};

export default client;
