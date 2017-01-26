import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';
import { Readable } from 'stream';

var AWS = require('aws-sdk');
const csv = require('csvtojson');
const fs  = require('fs');

const client = mozaik => {
    // state variables for internal timer
    let csvReportMonthsTimer = null;
    let csvReportMonthsFirstSubscription = true;

    mozaik.loadApiConfig(config);   // trigger validation of local config

    const pushCsvReportMonths = (callback, requestId) => {
        mozaik.logger.info(chalk.green(`[aws] pushCsvReportMonths (mode PUSH) processing...`));

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
                    
                    mozaik.logger.info(chalk.green(`[aws] pushCsvReportMonths (mode PUSH): report processed successfully`));
                    def.resolve(costs);
                });

                return def.promise;
            },
            nope => {
                return Promise.reject(nope);
            }
        ).then(costsObject => {
            // sending message to clients needs to be done after client is added into subscription's clients list in mozaik.bus.clientSubscription function
            setTimeout(() => {
                callback(costsObject);
            }, 200);
            return costsObject;
        }).then(costsObject => {
            // cache message for other websocket clients
            mozaik.bus.listSubscriptions()[requestId].cached = {
                id: requestId,
                body: costsObject
            };
            mozaik.logger.info(chalk.green(`[aws] pushCsvReportMonths (mode PUSH): report cached.`));
        }).catch(e => mozaik.logger.error(chalk.red(`[aws] pushCsvReportMonths (mode PUSH): went wrong: ${e}`)));
    };

    const checkCsvReportMonths = (callback, requestId, params) => {
        // are there subscribers for this api call?
        if (mozaik.bus.listSubscriptions()[requestId].clients.length) {
            // make GET request for report
            // and cache message for new incoming clients
            pushCsvReportMonths(callback, requestId);
        }
        // nobody subscribe this api anymore
        // clear local state
        // delete subscriptions object for this requestId in mozaik.bus
        else {
            if (csvReportMonthsTimer !== null) {    // make sure
                mozaik.logger.info(chalk.yellow(`[aws] csvReportMonths interval cleared`));
                clearInterval(csvReportMonthsTimer);
                csvReportMonthsTimer = null;
                csvReportMonthsFirstSubscription = true;
                delete mozaik.bus.listSubscriptions()[requestId];
            }
        }
    }

    const apiMethods = {
        // PUSH mode
        // manage timer (with long duration)
        csvReportMonths(callback, params) {
            if (typeof callback !== 'function') {
                mozaik.logger.error(chalk.red('mozaik-ext-aws-pricing supports only push API'));
                return Promise.reject(new Error('Use push API with mozaik-ext-aws-pricing'));
            }

            mozaik.logger.info(chalk.green(`[aws] First Subscription? ${JSON.stringify(csvReportMonthsFirstSubscription)}`));
            const requestId = 'aws.csvReportMonths';
            const s3interval = config.get('aws.s3pollInterval');

            // first time is special 
            // in mozaik Bus, api function is called and AFTER that client is added into list of subscribers
            if (csvReportMonthsFirstSubscription) {
                csvReportMonthsFirstSubscription = false;

                // make GET request
                // cache processed response
                pushCsvReportMonths(callback, requestId);
                // schedule private interval for API subscribers
                csvReportMonthsTimer = setInterval(() => {
                    checkCsvReportMonths(callback, requestId, params);
                }, s3interval);
            }
            // else: at least one client requested report in the meantime and timeout has not been cleared yet
            // websocket client will get cached report from mozaik.bus subscriptions
        },

        // POLL mode - abandoned, not efficient
        csvReportMonthsPOLL() {
            mozaik.logger.info(chalk.yellow(`[aws] processing csvReportMonths (mode POLL)`));

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
                    return Promise.reject({nope, status: 1234});    // just to see that failing is working
                }
            )
        },

        // component development abandoned
        // this service does not work with AWS linked accounts
        // POLL mode
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
        }
    };

    return apiMethods;

};

export default client;
