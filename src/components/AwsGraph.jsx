import React, { Component, PropTypes }  from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                       from 'react-mixin';
import { ListenerMixin }                from 'reflux';
import moment                           from 'moment';
import Mozaik                           from 'mozaik/browser';
const { Pie }                           = Mozaik.Component;
import _                                from 'lodash';

class AwsGraph extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      budgets: [],
      data: [],
      colors: ['#383878',  '#4F548C', '#376CAE', '#5F8BC2', '#6AC5CA'], // TODO: find more colours
      colorPick: 0,
      totalCost: 0,
      costDate: ''
    };
  }

  getApiRequest() {
    // const {  } = this.props;

    
    return { id: 'aws.csvReport' };
  }

  onApiData(costs) {
    // this.setState({ budgets });

    // console.log('budgets returned from API call:');
    // console.log(JSON.stringify(budgets));



    // testing one month (one line)
    // 0 - total cost of all time in report grouped by service
    // 1, 2, 3... - particular month with costs by service
    if(_.has(costs, '2')){
      let otherCosts = 0.0;
      this.state.data = [];
      this.state.colorPick = 0;
      
      _.forOwn(costs['2'], (value, key) => {
        if(key.match(/^Service/)) {
          // date is here
          this.state.costDate = moment(value, "YYYY-MM-DD").toDate();
          return;
        }
        if(key.match(/^Total cost/)) {
          // total cost is here
          this.state.totalCost = parseFloat(value).toFixed(2);
          return;
        }

        // values less than 3 dollars are pointless 
        //   -> accumulate them into 'otherCosts' value
        if(parseFloat(value) > 3){
          this.state.data.push({
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

      // add accumulated other costs
      this.state.data.push({
        id: 'other',
        count: otherCosts.toFixed(2),
        color: null,
        label: 'other'
      });

      this.state.data.sort((a,b) => { return Number(b.count) - Number(a.count); });
      
      _.forEach(this.state.data, (value, key) => {
        value.color = this.getNextColor();
      });
    }

    this.setState({ costs });
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
    const { data, costDate, totalCost } = this.state;
    const { innerRadius } = this.props;

    const holeRatio = innerRadius ? innerRadius : 0;
    const title = this.props.title ? this.props.title : (
      <span>
        <span>AOWP AWS&nbsp;</span>
        <span className="widget__header__subject">{moment(costDate).format("MMM YYYY")}</span>
      </span>
    );

    return (
        <div>
            <div className="widget__header">
                {title}
                <i className="fa fa-usd" />
            </div>
            <div className="widget__body">
                <Pie data={this.state.data} innerRadius={holeRatio} count={totalCost} countUnit={'$'} />
            </div>
        </div>
    );
  }
}

AwsGraph.displayname = 'AwsGraph';

AwsGraph.propTypes = {
  title: PropTypes.string,
  innerRadius: PropTypes.number,
  transitionDuration: PropTypes.number,
  idleCycles: PropTypes.number
};


reactMixin(AwsGraph.prototype, ListenerMixin);
reactMixin(AwsGraph.prototype, Mozaik.Mixin.ApiConsumer);

export default AwsGraph;