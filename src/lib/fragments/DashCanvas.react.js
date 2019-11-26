import React, { Component } from 'react';
import { SketchField, Tools } from 'react-sketch';
import {
	ZoomMinusIcon, ZoomPlusIcon, EditIcon, PanIcon, ArrowLeftIcon, ArrowRightIcon,
	RotateLeftIcon, RotateRightIcon, PlotLineIcon, SquareIcon, WrenchIcon, TrashIcon, SaveIcon
}
	from 'plotly-icons';

import { propTypes, defaultProps } from '../components/DashCanvas.react';

const styles = {
	button: {
		margin: '3px',
		padding: '0px',
		width: '50px',
		height: '50px',
		verticalAlign: 'middle',
	},

	textbutton: {
		verticalAlign: 'top',
		height: '50px',
		color: 'blue',
		verticalAlign: 'middle',
	}
};

/**
 * Canvas component for drawing on a background image and selecting
 * regions.
 */
export default class DashCanvas extends Component {
	constructor(props) {
		super(props);
		this.state = {
			height: 200
		};
		this._save = this._save.bind(this);
		this._next = this._next.bind(this);
		this._prev = this._prev.bind(this);
		this._update = this._update.bind(this);
		this._undo = this._undo.bind(this);
		this._zoom = this._zoom.bind(this);
		this._zoom_factor = this._zoom_factor.bind(this);
		this._unzoom = this._unzoom.bind(this);
		this._pantool = this._pantool.bind(this);
		this._penciltool = this._penciltool.bind(this);
		this._linetool = this._linetool.bind(this);
		this._selecttool = this._selecttool.bind(this);
		this._onObjectAdded = this._onObjectAdded.bind(this);
		this._onObjectModified = this._onObjectModified.bind(this);
		this._onSelectionCreated = this._onSelectionCreated.bind(this);
		this._onObjectMoving = this._onObjectMoving.bind(this);
		this.computeJSON = this.computeJSON.bind(this);
	}

	
	componentDidMount() {
		let sketch = this._sketch;

		sketch._fc.on('object:moving', this._onObjectMoving);
		sketch._fc.on('object:added', this._onObjectAdded);
		sketch._fc.on('object:modified', this._onObjectModified);
		sketch._fc.on('selection:created', this._onSelectionCreated);

		if (this.props.filename.length > 0 ||
			this.props.image_content.length > 0) {
			var content = (this.props.filename.length > 0) ? this.props.filename :
				this.props.image_content;
			var img = new Image();
			img.onload = () => {
				var new_height = this.state.height;
				var new_scale = 1;
				var height = img.height;
				var width = img.width;
				new_height = Math.round(height * sketch.props.width / width);
				new_scale = new_height / height;
				this.setState({ height: new_height });
				sketch.clear();
				let opts = {
					left: 0,
					top: 0,
					scale: new_scale
				}

				sketch._fc.loadFromJSON(JSON.parse(this.props.json_data_in), sketch._fc.renderAll.bind(sketch._fc), function(o, object) {
					// sketch._fc.setBackgroundImage(content,() => sketch._fc.renderAll(), opts);
					sketch.addImg(content, opts);
				});
				
				// console.log('merge this')
				// console.log(this._sketch.toJSON())
				// console.log(this.props.json_data_in)
				// let from_props = JSON.parse(this.props.json_data_in)
				// let internal = this._sketch.toJSON()
				// from_props.objects.forEach(function (item, index) {
				// 	internal.objects.push(item)
				//   });
				// console.log(internal)
				// // let json_data_in = Object.assign(this._sketch.toJSON(),JSON.parse(this.props.json_data_in))
				// this._sketch.fromJSON(internal)
				
			}
			img.src = content;
		} else if(this.props.json_data_in.length > 0){
			this._sketch.fromJSON(this.computeJSON(this.props.json_data_in))
		} else{
			sketch._fc.setBackgroundColor(sketch.props.backgroundColor);
		}

	}


	componentDidUpdate(prevProps) {
		let sketch = this._sketch;
		// Typical usage (don't forget to compare props):
		console.log('didupdate')
		if (
			(this.props.image_content !== prevProps.image_content)) {
			console.log('updating image content')
			var img = new Image();
			var new_height = this.state.height;
			var new_scale = 1;
			img.onload = () => {
				var height = img.height;
				var width = img.width;
				new_height = Math.round(height * sketch.props.width / width);
				new_scale = new_height / height;
				this.setState({ height: new_height });
				sketch.clear();
				let opts = {
					left: 0,
					top: 0,
					scale: new_scale
				}
				// sketch._fc.setBackgroundImage(this.props.image_content,() => sketch._fc.renderAll(), opts);

				sketch.addImg(this.props.image_content, opts);
			}
			img.src = this.props.image_content;
			if (this.props.setProps) {
				let JSON_string = JSON.stringify(this._sketch.toJSON());
				this.props.setProps({ json_data_in: JSON_string });
			}

			sketch._fc.setZoom(this.props.zoom);
		};

		if(this.props.json_data_in !== prevProps.json_data_in){
			console.log('updating jsom')
			
			this._sketch.fromJSON(this.computeJSON(this.props.json_data_in))
		};
	};

	// addRects(){
	// 	let canvas = this._canvas;
	// 	this.isDown = true;
	// 	let pointer = canvas.getPointer(o.e);
	// 	this.startX = pointer.x;
	// 	this.startY = pointer.y;
	// 	rect = new fabric.Rect({
	// 		left: this.startX,
	// 		top: this.startY,
	// 		originX: 'left',
	// 		originY: 'top',
	// 		width: pointer.x - this.startX,
	// 		height: pointer.y - this.startY,
	// 		stroke: this._color,
	// 		strokeWidth: this._width,
	// 		fill: this._fill,
	// 		//fill: 'rgba(255,0,0,0.5)',
	// 		transparentCorners: false,
	// 		selectable: false,
	// 		evented: false,
	// 		angle: 0
	// 	});
	// 	canvas.add(this.rect);
	// }


	
	_onObjectMoving(e){
		console.log('object moving')
		// console.log(e.target.__originalState)
		console.log(e.target)
		if (e.target.type == "image"){
			console.log('as')
			e.target.left = 0
			e.target.top = 0
			e.target.selectable = false
			let pointer = this._sketch._fc.getPointer(e);
			console.log(pointer)
			pointer.selectable = false
			pointer.evented = false

			this._sketch._fc.discardActiveObject(e)
		}	
	}
	_onSelectionCreated(e){
		console.log('selection created')
		// console.log(e.target.__originalState)
		console.log(e)
		if (e.target.type == "image"){
			console.log('as')
			e.target.left = 0
			e.target.top = 0
			e.target.selectable = false
			// let pointer = this._sketch._fc.getPointer(e);
			// pointer.selectable = false
			// pointer.evented = false

			this._sketch._fc.discardActiveObject(e)
		}	
	}

	_onObjectModified(e) {
		this._sketch._onObjectModified(e)
		// console.log(e)
	}

	  /**
	 * Action when an object is added to the canvas
	 */
	_onObjectAdded(e) {
		// let pointer = this._sketch._fc.getPointer(e);
		// pointer.selectable = false
		// pointer.evented = false
		// e.target.selectable = false
		// e.target.evented = false
		this._sketch._onObjectAdded(e)
		if (e.target.type == "image"){
			// here we are actually assuming that only one image will be added
			this._sketch._fc.sendToBack(e.target)



			// this._sketch._fc.renderAll();
			// this._sketch._fc.calcOffset();
		}
	}

	computeJSON(json_data_string){
		let json_data = JSON.parse(json_data_string)
		let scale = 1
		let image_width = 1
		let image_height = 1
		var new_height = this.state.height;
		var new_scale = 1;

		for (let i in  json_data.objects){
			if (json_data.objects[i].type == 'image'){
				console.log('load image')
				console.log(json_data.objects[i])
				json_data.objects[i].scaleX 
				image_height = json_data.objects[i].height
				image_width = json_data.objects[i].width
				new_height = Math.round(image_height * this._sketch.props.width / image_width);
				new_scale = new_height / image_height;
				new_scale = this._prec(new_scale)
				json_data.objects[i].scaleX = new_scale
				json_data.objects[i].scaleY = new_scale
				this.setState({ height: new_height });
			}
		}


		for (let i in  json_data.objects){
			if (json_data.objects[i].type == 'rect'){
				console.log('load rect')
				console.log(json_data.objects[i])
				json_data.objects[i].left = json_data.objects[i].left * image_width * new_scale
				json_data.objects[i].top = json_data.objects[i].top * image_height * new_scale
				json_data.objects[i].right = json_data.objects[i].right * image_width * new_scale
				json_data.objects[i].bottom = json_data.objects[i].bottom * image_height * new_scale

				json_data.objects[i].width = json_data.objects[i].right - json_data.objects[i].left 
				json_data.objects[i].height = json_data.objects[i].bottom - json_data.objects[i].top 
			}
		}

		console.log(json_data)
		return json_data
	}

	_prec(in_value){
		return Math.round(100000*in_value)/100000
	}

	_save() {
		let json_data = this._sketch.toJSON(['__removed'])
		let scale = 1
		let image_width = 1
		let image_height = 1
		for (let i in  json_data.objects){
			if (json_data.objects[i].type == 'image'){
				console.log('image')
				console.log(json_data.objects[i])
				json_data.objects[i].src = '' // delete image data
				scale = json_data.objects[i].scaleX
				image_width = json_data.objects[i].width
				image_height = json_data.objects[i].height
			}
		}

		for (let i in  json_data.objects){
			if (json_data.objects[i].type == 'rect'){
				let scale_factor = json_data.objects[i].scaleX / scale
				scale_factor = this._prec(scale_factor)
				console.log('rect')
				console.log(json_data.objects[i])
				json_data.objects[i].right = json_data.objects[i].left + json_data.objects[i].width
				json_data.objects[i].bottom = json_data.objects[i].top + json_data.objects[i].height

				json_data.objects[i].left = json_data.objects[i].left * scale_factor / image_width
				json_data.objects[i].top = json_data.objects[i].top * scale_factor / image_height
				json_data.objects[i].right = json_data.objects[i].right * scale_factor / image_width
				json_data.objects[i].bottom = json_data.objects[i].bottom * scale_factor / image_height

				json_data.objects[i].left = this._prec(json_data.objects[i].left)
				json_data.objects[i].top = this._prec(json_data.objects[i].top)
				json_data.objects[i].right = this._prec(json_data.objects[i].right)
				json_data.objects[i].bottom = this._prec(json_data.objects[i].bottom)
			}
		}

		if (this.props.setProps) {
			this.props.setProps({ json_data_out: JSON.stringify(json_data)});
		}
	};

	_next() {
		let toggle_value = this.props.next_trigger + 1
		if (this.props.setProps) {
			this.props.setProps({ next_trigger: toggle_value });
		}
	};

	_prev() {
		let toggle_value = this.props.prev_trigger + 1
		if (this.props.setProps) {
			this.props.setProps({ prev_trigger: toggle_value });
		}
	};

	_update() {
		console.log(this._sketch)
		console.log(this.props.json_data_in)
		this._sketch.fromJSON(this.props.json_data_in)
		console.log(this._sketch)


	};


	_undo() {
		this._sketch.undo();
		this.setState({
			canUndo: this._sketch.canUndo(),
			canRedo: this._sketch.canRedo()
		})
	};
	_redo() {
		this._sketch.redo();
		console.log(this._sketch);
		this.setState({
			canUndo: this._sketch.canUndo(),
			canRedo: this._sketch.canRedo()
		})
	};

	_zoom_factor(factor) {
		this._sketch.zoom(factor);
		let zoom_factor = this.props.zoom;
		this.props.setProps({ zoom: factor * zoom_factor })
	};


	_zoom() {
		this._sketch.zoom(1.25);
		let zoom_factor = this.props.zoom;
		this.props.setProps({ zoom: 1.25 * zoom_factor })
	};


	_unzoom() {
		this._sketch.zoom(0.8);
		let zoom_factor = this.props.zoom;
		this.props.setProps({ zoom: 0.8 * zoom_factor });
	};


	_pantool() {
		this.props.setProps({ tool: "pan" });
	};


	_penciltool() {
		this.props.setProps({ tool: "pencil" });
	};


	_linetool() {
		this.props.setProps({ tool: "line" });
	};


	_rectangletool() {
		this.props.setProps({ tool: "rectangle" });
	};



	_selecttool() {
		this.props.setProps({ tool: "select" });
	};

	_removeSelected() {
		this._sketch.removeSelected()
		// let canvas = this._sketch._fc;
		// let activeObj = canvas.getActiveObject();
		// if (activeObj) {
		// let selected = [];
		// if (activeObj.type === 'activeSelection') {
		// 	activeObj.forEachObject(obj => selected.push(obj));
		// } else {
		// 	selected.push(activeObj)
		// }
		// selected.forEach(obj => {
		// 	obj.__removed = true;
		// 	let objState = obj.toJSON();
		// 	obj.__originalState = objState;
		// 	let state = JSON.stringify(objState);
		// 	this._sketch._history.keep([obj, state, state]);
		// 	canvas.remove(obj);
		// });
		// canvas.discardActiveObject();
		// canvas.requestRenderAll();
		// }
	};


	render() {
		var toolsArray = {};
		toolsArray["pencil"] = Tools.Pencil;
		toolsArray["pan"] = Tools.Pan;
		toolsArray["line"] = Tools.Line;
		toolsArray["circle"] = Tools.Circle;
		toolsArray["select"] = Tools.Select;
		toolsArray["rectangle"] = Tools.Rectangle;
		const hide_buttons = this.props.hide_buttons;
		const show_line = !(hide_buttons.includes("line"));
		const show_pan = !(hide_buttons.includes("pan"));
		const show_zoom = !(hide_buttons.includes("zoom"));
		const show_pencil = !(hide_buttons.includes("pencil"));
		const show_undo = !(hide_buttons.includes("undo"));
		const show_select = !(hide_buttons.includes("select"));
		const show_remove = !(hide_buttons.includes("remove"));
		const show_rectangle = !(hide_buttons.includes("rectangle"));
		var width_defined = this.props.width > 0;
		var width = width_defined ? this.props.width : null;
		return (
			<div className={this.props.className}>
				<SketchField name='sketch'
					ref={(c) => this._sketch = c}
					tool={toolsArray[this.props.tool.toLowerCase()]}
					lineColor={this.props.lineColor}
					width={width}
					height={this.state.height}
					forceValue={true}
					backgroundColor='#ccddff'
					lineWidth={this.props.lineWidth} />
				{show_zoom &&
					<button style={styles.button}
						title="Zoom in"
						onClick={(e) => this._zoom()}>
						<ZoomPlusIcon />
					</button>
				}
				{show_zoom &&
					<button style={styles.button}
						title="Zoom out"
						onClick={(e) => this._unzoom()}>
						<ZoomMinusIcon />
					</button>
				}
				{show_pencil &&
					<button style={styles.button}
						title="Pencil tool"
						onClick={(e) => this._penciltool()}>
						<EditIcon />
					</button>
				}
				{show_line &&
					<button style={styles.button}
						title="Line tool"
						onClick={(e) => this._linetool()}>
						<PlotLineIcon />
					</button>
				}
				{show_rectangle &&
					<button style={styles.button}
						title="Rectangle tool"
						onClick={(e) => this._rectangletool()}>
						<SquareIcon />
					</button>
				}
				{show_pan &&
					<button style={styles.button}
						title="Pan"
						onClick={(e) => this._pantool()}>
						<PanIcon />
					</button>
				}
				{show_undo &&
					<button style={styles.button}
						title="Undo"
						onClick={(e) => this._undo()}>
						<RotateLeftIcon />
					</button>
				}
				{show_undo &&
					<button style={styles.button}
						title="Redo"
						onClick={(e) => this._redo()}>
						<RotateRightIcon />
					</button>
				}
				{show_select &&
					<button style={styles.button}
						title="Select"
						onClick={(e) => this._selecttool()}>
						<WrenchIcon />
					</button>
				}
				{show_remove &&
					<button style={styles.button}
						title="Remove Selected"
						onClick={(e) => this._removeSelected()}>
						<TrashIcon />
					</button>
				}

				<button style={styles.button}
					title="Previous"
					onClick={(e) => this._prev()}>
					<ArrowLeftIcon />
				</button>

				<button style={styles.button}
					title="Next"
					onClick={(e) => this._next()}>
					<ArrowRightIcon />
				</button>

				<button style={styles.button}
					title="Save"
					onClick={(e) => this._save()}>
					<SaveIcon />
				</button>
				
			</div>

		)
	}
}

DashCanvas.defaultProps = defaultProps;
DashCanvas.propTypes = propTypes;
