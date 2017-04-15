import React, { Component, PropTypes }  from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                       from 'react-mixin';
import { ListenerMixin }                from 'reflux';
import moment                           from 'moment';
import Mozaik                           from 'mozaik/browser';
import Pie                              from '../fancyPie/Pie.jsx';
import _                                from 'lodash';

class AwsMonthByService extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      colors: ['#383878', '#444A8C', '#4F5BA0', '#476CB5', '#5886CA', '#78A0E6', '#81BBE0', '#AAD5EE'], // TODO: adjust colours
      colorPick: 0,
      totalCost: 0,
      billingPeriod: ''
    };
  }

  getApiRequest() {
    return {
      id: 'aws.csvReportMonths'
    };
  }

  onApiData(costs) {
    const { choice, minMeaningfulCost } = this.props;

    let data = [];

    // choice 0 - total costs of all time in report (by service)
    // choice 1, 2, 3... - particular month with costs by service
    //        1 - the most recent month
    //        2 - second most recent month ...
    //        12 - should be last index (12th most recent month)
    if(_.has(costs, `${choice}`)){
      let otherCosts = 0.0;
      
      _.forOwn(costs[`${choice}`], (value, key) => {
        if(key.match(/^Service/)) {
          if(value.match(/Service Total/g)){
            // this row contains Total Costs for whole measured time of report
            this.state.billingPeriod = '12 previous months';
          }
          else{
            // date is here
            this.state.billingPeriod = moment(value, "YYYY-MM-DD").toDate();
          }
          return;
        }
        if(key.match(/^Total cost/)) {
          // total cost is here
          this.state.totalCost = Number(parseFloat(value).toFixed(2));
          return;
        }

        // values less than minMeaningfulCost are pointless 
        //   -> accumulate them into 'otherCosts' value
        if(parseFloat(value) > minMeaningfulCost){
          // remove currency from key name
          const currencyIndex = key.lastIndexOf('($)');
          if (currencyIndex != -1){
            key = key.substr(0, currencyIndex).trim();
          }

          data.push({
            id: key,
            count: parseFloat(value).toFixed(2),
            color: null,
            label: key
          })
        }
        else{
          otherCosts += parseFloat(value);
        }
      });

      // add accumulated otherCosts
      data.push({
        id: 'Other',
        count: otherCosts.toFixed(2),
        color: null,
        label: 'Other'
      });

      // sort data and assign color according to order
      data.sort((a,b) => { return Number(b.count) - Number(a.count); });
      
      this.state.colorPick = 0;

      _.forEach(data, (value, key) => {
        value.color = this.getNextColor();
      });
    }
    else {
      // wrong user choice property
      this.state.billingPeriod = 'unknown';
    }

    // trigger render
    this.setState({ data });
  }

  getNextColor() {
    const { colors } = this.state;

    // rotation
    if (this.state.colorPick >= colors.length)
      this.state.colorPick = 0;
    
    const index = this.state.colorPick;
    this.state.colorPick++;
    return colors[index];
  }

  render() {
    const { data, billingPeriod, totalCost } = this.state;
    const { innerRadius } = this.props;

    const title = this.props.title ? this.props.title : (
      <span>
        <span>AWS&nbsp;</span>
        <span className="widget__header__subject">{
          typeof billingPeriod === 'string' ? billingPeriod : moment(billingPeriod).format("MMM YYYY")
        }</span>
      </span>
    );

    return (
        <div>
            <div className="widget__header">
                {title}
                <i className="fa fa-usd" />
            </div>
            <div className="widget__body">
                <Pie data={this.state.data} innerRadius={innerRadius} count={totalCost} countUnit={'$'} />
            </div>
        </div>
    );
  }
}

AwsMonthByService.displayname = 'AwsMonthByService';

AwsMonthByService.propTypes = {
  choice: PropTypes.number.isRequired,
  minMeaningfulCost: PropTypes.number.isRequired,
  title: PropTypes.string,
  innerRadius: PropTypes.number,
  transitionDuration: PropTypes.number,
};

AwsMonthByService.defaultProps = {
    innerRadius: 0,
    minMeaningfulCost: 1
};


reactMixin(AwsMonthByService.prototype, ListenerMixin);
reactMixin(AwsMonthByService.prototype, Mozaik.Mixin.ApiConsumer);

export default AwsMonthByService;
