import request from 'superagent';
import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';

var AWS = require('aws-sdk');
require('superagent-bluebird-promise');
const csv = require('csvtojson');
const fs  = require('fs');

const client = mozaik => {

    mozaik.loadApiConfig(config);

    // worked even without this
    AWS.config.setPromisesDependency(require('bluebird'));      // unnecessary ?

    // AWS.config.region = config.get('aws.region');
    AWS.config.update({ region: config.get('aws.region') });    // unnecessary ?

    const awsBudgets = new AWS.Budgets({apiVersion: '2016-10-20'});

    const apiMethods = {
        budgets() {
            const accId = config.get('aws.accountID');
            mozaik.logger.info(`accID: ${accId}`);

            const params = {
                AccountId:  accId, /* required */
                MaxResults: 10
                // NextToken:  'STRING_VALUE'   // not required
            };

            return awsBudgets.describeBudgets(params).promise()
                .then(
                    budgets => { mozaik.logger.error(chalk.red(`we got this: ${JSON.stringify(budgets)}, ${typeof budgets}`)); return budgets },
                    error => { 
                        if (error.message)
                            mozaik.logger.error(chalk.red(`${JSON.stringify(error.message)}`)); 
                        return Promise.reject(error);
                    }
                );
        },

        csv() {
            const def = Promise.defer();
            let costs = {};

            csv({
                quote: 'off'
            })
            .fromStream(fs.createReadStream('costsMonthlyByService.csv'))
            .on('json', (jsonObj, rowIndex) => {
                costs[`${rowIndex}`] = jsonObj;
            })
            .on('error', err => {
                console.log(`err ${err}`);
                def.reject(err);
            })
            .on('done', error => {
                if(error)
                    def.reject(error);
                else
                    def.resolve(costs);
            });

            return def.promise;
        }
    };

    return apiMethods;

};

export default client;
