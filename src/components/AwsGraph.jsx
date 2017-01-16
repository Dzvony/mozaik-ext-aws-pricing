import React, { Component, PropTypes }  from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                       from 'react-mixin';
import { ListenerMixin }                from 'reflux';
import Mozaik                           from 'mozaik/browser';
const { Pie }                           = Mozaik.Component;
import _                                from 'lodash';

class AwsGraph extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      budgets: [],
      data: [],
      colors: ['red', 'blue', '#9ACD32', 'brown', 'grey'],
      colorPick: 0
    };
  }

  getApiRequest() {
    // const {  } = this.props;

    
    return { id: 'aws.csv' };
  }

  onApiData(costs) {
    // this.setState({ budgets });

    // console.log('budgets returned from API call:');
    // console.log(JSON.stringify(budgets));

    this.setState({ costs });
  }

  getNextColor() {
    const { colors } = this.state;

    if (this.state.colorPick >= colors.length)
      this.state.colorPick = 0;
    
    return colors[this.state.colorPick++];
  }

  // const data = [
    //   {
    //     id: 'Dynamo',
    //     count: 230,
    //     color: ''
    //   },
    //   {
    //     id: 'EC2',
    //     count: 50,
    //     color: ''
    //   }
    // ]


// <Pie data={[{ data: data }]} spacing={} innerRadius={} transitionDuration={} />
// {JSON.stringify(costs)}
// <Pie data={[{ data: this.state.data }]} />
  render() {
    const { costs } = this.state;
    const title = this.props.title ? this.props.title : 'AWS';
    
    // draw one month (one line)
    if(_.has(costs, '1')){
      this.state.data = [];
      this.state.colorPick = 0;
      
      _.forOwn(costs['1'], (value, key) => {
        if(key.match(/^Service/)) {
          // date is here
          // dont push to this.state.data
          return;
        }
        if(key.match(/^Total cost/)) {
          // total cost is here
          // dont push to this.state.data
          return;
        }
        if(parseFloat(value) > 0.1){
          this.state.data.push({
            id: key,
            count: Math.ceil(parseFloat(value)),
            color: this.getNextColor()
          })
        }
      });
    }

    return (
        <div>
            <div className="widget__header">
                {title}
                <i className="fa fa-cloud" />
            </div>
            <div className="widget__body">
                <Pie data={[{ data: this.state.data }]} />
            </div>
        </div>
    );
  }

  // return (
    //     <div>
    //         <div className="widget__header">
    //             AWS
    //             <span className="widget__header__count">
    //                 {this.state.budgets.length}
    //             </span>
    //             <i className="fa fa-cloud" />
    //         </div>
    //         <div className="widget__body">
    //             <Pie data={[{ data: data }]} spacing={} innerRadius={} transitionDuration={} />
    //         </div>
    //     </div>
    // );
}

AwsGraph.displayname = 'AwsGraph';

AwsGraph.propTypes = {
  title: PropTypes.string,
  innerRadius: PropTypes.number,
  transitionDuration: PropTypes.number
}


reactMixin(AwsGraph.prototype, ListenerMixin);
reactMixin(AwsGraph.prototype, Mozaik.Mixin.ApiConsumer);

export default AwsGraph;