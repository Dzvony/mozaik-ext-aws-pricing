# Mozaïk Amazon Web Services widgets

## Configuration

### AWS Client Configuration

In order to use the Mozaïk AWS widgets, you must configure its **client**.

### parameters

key                     | env key                                | required | description                              
------------------------|----------------------------------------|----------|------------------------------------------
`s3pollInterval`        | AWS_S3_POLL_INTERVAL                   | yes      | *interval in miliseconds for S3 request* 
`s3bucket`              | AWS_S3_BUCKET                          | yes      | *AWS S3 bucket name*
`s3keyMonthByService`   | AWS_S3_KEY_MONTH_BY_SERVICE            | yes      | *jenkins auth password*
`awsAccessKeyId`        | AWS_MOZAIK_DASHBOARD_ACCESS_KEY_ID     | yes      | *AWS access key of IAM user (with rights to access S3) used by aws-sdk*
`awsSecretAccessKey`    | AWS_MOZAIK_DASHBOARD_SECRET_ACCESS_KEY | yes      | *AWS secret access key of IAM user used by aws-sdk*

### usage

```javascript
{
  //…
  api: {
    //…
    aws: {
      s3pollInterval: 60000,
      s3bucket: 'my-bucket-name',
      s3keyMonthByService: 'path/to/report-file-in-s3-bucket.csv',
      awsAccessKeyId: 'will be replaced by your env var AWS_MOZAIK_DASHBOARD_ACCESS_KEY_ID',
      awsSecretAccessKey: 'will be replaced by your env var AWS_MOZAIK_DASHBOARD_SECRET_ACCESS_KEY'
    }
    //…
  }
  //…
}
```

## AWS costs in calendar month by service

![AWS costs in month by service](https://raw.githubusercontent.com/Dzvony/mozaik-ext-aws-pricing/master/preview/AwsMonthByService.jpg)

> Show AWS costs.

### parameters

key                     | required |     default | description
------------------------|----------|-------------|---------------
`choice`                | yes      |             | *0 - total costs of all time in report (by service) <br> 1 - the most recent month of report <br> 2 - second most recent month of report <br> ... <br> 12 - the oldest month of 12-month report*
`minMeaningfulCost`     | no       |           1 | *Costs smaller than this value will be included in category Other*
`innerRadius`           | no       |           0 | *Decimal number representing amount of empty space <br> in dougnut chart's center*
`title`                 | no       | data driven | *user supplied title of widget*

### usage

```javascript
{
  type: 'aws.aws_month_by_service',
  choice: 0,
  minMeaningfulCost: 3,
  innerRadius: 0.65,
  columns: 2, rows: 1,
  x: 1, y: 1
},
```

### Report
Report needs to be downloaded manually from aws console (*My Billing dashbaord > Cost Explorer > Monthly Spend by Service View*)

Select
- Time range - Historical (12 months)
- Grouping - Group by (Service)
- Download CSV

Place your report into your Amazon S3 bucket, set environment variables for dashboard
- AWS_S3_BUCKET = *bucket-name*
- AWS_S3_KEY_MONTH_BY_SERVICE = *file-name-with-path*

#### Report scheme

Service                  | *service1* | *service2* | ... | *Total cost*
-------------------------|------------|------------|-----|------------
**Service total**        | *number*   | *number*   | ... | *number*
*Date string like below* | *number*   | *number*   | ... | *number*
*01-01-17*               | *number*   |            | ... | *number*
*01-12-16*               | *number*   | *number*   | ... | *number*
*01-11-16*               |            | *number*   | ... | *number*
...                      | ...        | ...        | ... | *number*
