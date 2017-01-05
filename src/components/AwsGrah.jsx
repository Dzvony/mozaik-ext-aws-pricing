import React, { Component, PropTypes }  from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                       from 'react-mixin';
import { ListenerMixin }                from 'reflux';
import Mozaik                           from 'mozaik/browser';

class AwsGraph extends Component {
  constructor(props) {
    super(props);


  }

  getApiRequest() {
    // const {  } = this.props;

    
    return { id: 'aws.budgets' };
  }

  onApiData(budgets) {
    this.setState({ budgets });

    console.log('budgets returned from API call:');
    console.log(JSON.stringify(budgets));
  }

  render() {
    return (
        <div>
            <div className="widget__header">
                AWS budgets
                <span className="widget__header__count">
                    {this.state.budgets.length}
                </span>
                <i className="fa fa-cloud" />
            </div>
            <div className="widget__body">
                {JSON.stringify(this.state.budgets)}
            </div>
        </div>
    );
  }
}

AwsGraph.displayname = 'AwsGraph';

AwsGraph.propTypes = {

}


reactMixin(Jobs.prototype, ListenerMixin);
reactMixin(Jobs.prototype, Mozaik.Mixin.ApiConsumer);

export default AwsGraph;