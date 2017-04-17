import React, { Component, PropTypes } from 'react';


class PieLegends extends Component {
    render() {
        const { legends } = this.props;

        const legendNodes = legends.map(legend => (
            <span key={legend.id} id={`legend_item_${legend.id}`} className="fancy_pie_legends_item" 
                    onMouseEnter={this.handleEnter.bind(this, legend.id)}
                    onMouseLeave={this.handleLeave.bind(this, legend.id)}>
                <span className="fancy_pie_legends_item_color" style={{ background: legend.color }} id={`legend_color_${legend.id}`}/>
                <span className="fancy_pie_legends_item_label">{legend.label}</span>
                <span className="fancy_pie_legends_item_count">{legend.count}</span>
            </span>
        ));

        return (
            <div className="fancy_pie_legends">
                {legendNodes}
            </div>
        );

    }

    handleEnter(id) {
        console.log('handleEnter triggered, id:', id)
        // row
        document.getElementById(`legend_item_${id}`)
            .setAttribute('class', 'fancy_pie_legends_item fancy_pie_legends_item_highlight')
        // color square
        document.getElementById(`legend_color_${id}`)
            .setAttribute('class', 'fancy_pie_legends_item_color fancy_pie_legends_item_color_highlight')
        // svg path arch drawing
        document.getElementById(`svg_${id}`).setAttribute('class', 'pie_slice pie_slice_highlight')
    }

    handleLeave(id) {
        console.log('handleLeave triggered, id:', id)
        // row
        document.getElementById(`legend_item_${id}`)
            .setAttribute('class', 'fancy_pie_legends_item')
        // color square
        document.getElementById(`legend_color_${id}`)
            .setAttribute('class', 'fancy_pie_legends_item_color')
        // svg path arch drawing
        document.getElementById(`svg_${id}`).setAttribute('class', 'pie_slice')
    }
}

PieLegends.propTypes = {
    legends: PropTypes.array.isRequired
};


export default PieLegends;
