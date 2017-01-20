import React, { Component, PropTypes } from 'react';


class PieLegends extends Component {
    render() {
        const { legends } = this.props;

        const legendNodes = legends.map(legend => (
            <span key={legend.id} className="fancy_pie_legends_item">
                <span className="fancy_pie_legends_item_color" style={{ background: legend.color }}/>
                <span className="fancy_pie_legends_item_count">{legend.count}</span>
                <span className="fancy_pie_legends_item_label">{legend.label}</span>
            </span>
        ));

        return (
            <div className="fancy_pie_legends">
                {legendNodes}
            </div>
        );

    }
}

PieLegends.propTypes = {
    legends: PropTypes.array.isRequired
};


export default PieLegends;
