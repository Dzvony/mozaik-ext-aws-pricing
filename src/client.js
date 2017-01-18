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
    AWS.config.update({ region: config.get('aws.region') });    // necessary only for some services

    const apiMethods = {
        // does not work with AWS linked accounts
        budgets() {
            const awsBudgets = new AWS.Budgets({apiVersion: '2016-10-20'});

            const accId = config.get('aws.accountID');

            const params = {
                AccountId:  accId, /* required */
                MaxResults: 10
                // NextToken:  'STRING_VALUE'   // not required
            };

            return awsBudgets.describeBudgets(params).promise()
                .then(
                    budgets => { mozaik.logger.info(chalk.yellow(`we got this: ${JSON.stringify(budgets)}, ${typeof budgets}`)); return budgets },
                    error => { 
                        if (error.message)
                            mozaik.logger.error(chalk.red(`${JSON.stringify(error.message)}`)); 
                        return Promise.reject(error);
                    }
                );
        },

        csvReport() {
            mozaik.logger.info(chalk.yellow(`[aws] processing csvReport`));

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
