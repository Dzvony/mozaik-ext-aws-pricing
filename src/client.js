import request from 'superagent';
import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';
import fs      from 'fs';
import AWS     from 'aws-sdk';
require('superagent-bluebird-promise');

const client = mozaik => {

    mozaik.loadApiConfig(config);

    AWS.config.region = config.get('aws.region');
    const budgets = new AWS.Budgets({apiVersion: '2016-10-20'});


    const apiMethods = {
        budgets() {
            const def = Promise.defer();

            const params = {
                AccountId:  config.get('aws.accountID'), /* required */
                MaxResults: 10,
                NextToken:  'STRING_VALUE'
            };
            budgets.describeBudgets(params, function (err, data) {
                if (err)  def.reject(err);              // console.log(err, err.stack); // an error occurred
                else      def.resolve(data.budgets);    // console.log(data);           // successful response
            });

            return def.promise;
        }
    };

    return apiMethods;

};

export default client;
