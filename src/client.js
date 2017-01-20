import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';
import { Readable } from 'stream';

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

            const s3 = new AWS.S3({apiVersion: '2006-03-01'});

            const params = {
                Bucket: config.get('aws.s3bucket'),
                Key: config.get('aws.s3keyMonthByService')
            }

            return s3.getObject(params).promise()
            .then(
                yep => {
                    const s = new Readable();
                    s.push(yep.Body.toString());
                    s.push(null);

                    const def = Promise.defer();
                    let costs = {};

                    csv().fromStream(s)
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
                },
                nope => {
                    return Promise.reject({nope, status: 1234});    // still does not work for Mozaik Bus, aint nobody got time for that
                }
            )
        }
    };

    return apiMethods;

};

export default client;
