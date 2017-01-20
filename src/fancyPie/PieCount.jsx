import React, { Component, PropTypes } from 'react';


class PieCount extends Component {
    render() {
        const { count, unit, label } = this.props;

        let unitNode = null;
        if (unit !== undefined) {
            unitNode = <span className="fancy_pie_count_unit">{unit}</span>;
        }

        let labelNode = null;
        if (label !== undefined) {
            labelNode = <span className="fancy_pie_count_label">{label}</span>;
        }

        return (
            <div className="fancy_pie_count">
                <span className="fancy_pie_count_value">{count}</span>
                {unitNode}
                {labelNode}
            </div>
        );

    }
}

PieCount.propTypes = {
    count: PropTypes.number.isRequired,
    unit:  PropTypes.string,
    label: PropTypes.string
};


export default PieCount;
