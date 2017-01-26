import React, { Component, PropTypes }  from 'react'; // eslint-disable-line no-unused-vars
import reactMixin                       from 'react-mixin';
import { ListenerMixin }                from 'reflux';
import moment                           from 'moment';
import Mozaik                           from 'mozaik/browser';
import _                                from 'lodash';

class AwsMonthToDate extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      
    };
  }

  getApiRequest() {
    // const {  } = this.props;
    
    return { id: 'aws.csvReportMonthToDate' };
  }

  onApiData(costs) {
    let data = [];
    
    // trigger render
    this.setState({ data });
  }

  render() {
    const {  } = this.state;
    const {  } = this.props;

    const title = this.props.title ? this.props.title : (
      <span>
        <span>AWS&nbsp;</span>
        <span className="widget__header__subject">{}</span>
      </span>
    );

    return (
        <div>
            <div className="widget__header">
                {title}
                <i className="fa fa-usd" />
            </div>
            <div className="widget__body">
                
            </div>
        </div>
    );
  }
}

AwsMonthToDate.displayname = 'AwsMonthToDate';

AwsMonthToDate.propTypes = {
  
};

AwsMonthToDate.defaultProps = {
  
};


reactMixin(AwsMonthToDate.prototype, ListenerMixin);
reactMixin(AwsMonthToDate.prototype, Mozaik.Mixin.ApiConsumer);

export default AwsMonthToDate;
