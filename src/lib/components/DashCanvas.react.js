import PropTypes from 'prop-types';
import React, { Component, lazy, Suspense } from 'react';

// eslint-disable-next-line no-inline-comments
const RealDashCanvas = lazy(() => import(/* webpackChunkName: "canvas" */ '../fragments/DashCanvas.react'));

/**
 * Canvas component for drawing on a background image and selecting
 * regions.
 */
export default class DashCanvas extends Component {
    render() {
        return (
            <Suspense fallback={null}>
                <RealDashCanvas {...this.props} />
            </Suspense>
        );
    }
}

DashCanvas.defaultProps = {
    filename: '',
    json_data_in: '', json_data_out: '', image_content: '', trigger: 0, next_trigger: 0, prev_trigger: 0,
    width: 500, height: 500, scale: 1, lineWidth: 10,
    lineColor: 'red', tool: "pencil", zoom: 1,
    goButtonTitle: 'Save', updateButtonTitle: 'Update', hide_buttons: []
};

DashCanvas.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks
     */
    id: PropTypes.string,

    /**
     * Image data string, formatted as png or jpg data string. Can be
     * generated by utils.io_utils.array_to_data_string.
     */
    image_content: PropTypes.string,

    /**
     * Zoom factor
     */
    zoom: PropTypes.number,


    /**
     * Width of the canvas
     */
    width: PropTypes.number,

	/**
	* Height of the canvas
	*/
    height: PropTypes.number,

    /**
     * Scaling ratio between canvas width and image width
     */
    scale: PropTypes.number,

    /**
     * Selection of drawing tool, among ["pencil", "pan", "circle",
     * "rectangle", "select", "line"].
     */
    tool: PropTypes.string,

    /**
     * Width of drawing line (in pencil mode)
     */
    lineWidth: PropTypes.number,

    /**
     * Color of drawing line (in pencil mode). Can be a text string,
     * like 'yellow', 'red', or a color triplet like 'rgb(255, 0, 0)'.
     * Alpha is possible with 'rgba(255, 0, 0, 0.5)'.
     */
    lineColor: PropTypes.string,

    /**
     * Title of button
     */
    goButtonTitle: PropTypes.string,

    /**
     * Title of update button
     */
    updateButtonTitle: PropTypes.string,


    /**
     * Name of image file to load (URL string)
     */
    filename: PropTypes.string,


    /**
     * Counter of how many times the save button was pressed
     * (to be used mostly as input)
     */
    trigger: PropTypes.number,


    /**
     * Counter of how many times the next button was pressed
     * (to be used mostly as input)
     */
    next_trigger: PropTypes.number,


    /**
     * Counter of how many times the prev button was pressed
     * (to be used mostly as input)
     */
    prev_trigger: PropTypes.number,


    /**
     * Sketch content as JSON string, containing background image and
     * annotations. Use utils.parse_json.parse_jsonstring to parse
     * this string.
     */
    json_data_in: PropTypes.string,

        /**
     * Sketch content as JSON string, containing background image and
     * annotations. Use utils.parse_json.parse_jsonstring to parse
     * this string.
     */
    json_data_out: PropTypes.string,

    /**
     * Names of buttons to hide. Names are "zoom", "pan", "line", "pencil",
     * "rectangle", "undo", "select".
     */
    hide_buttons: PropTypes.arrayOf(PropTypes.string),

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change
     */
    setProps: PropTypes.func
};

export const propTypes = DashCanvas.propTypes;
export const defaultProps = DashCanvas.defaultProps;
