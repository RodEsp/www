import cytoscape from 'cytoscape';
import cyViewUtilities from 'cytoscape-view-utilities';
import ulog from 'ulog';

import craftingdata from './craftingdata.json';

cyViewUtilities(cytoscape);

const log = ulog('last-oasis-crafting-graph');
log.level = log.INFO;

const elements = [];
const allItems = {};

// Use lowercase names with spaces removed as node and edge IDs.
let itemNameToLowerCase = '';
let ingredientNameToLowerCase = '';

// Add all items to an object so we can use it as a hashmap to see if an item doesn't already exist as a node.
craftingdata.forEach((item) => {
	itemNameToLowerCase = item.name.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '').toLowerCase();

	allItems[itemNameToLowerCase] = true;
});

craftingdata.forEach((item) => {
	// Add nodes
	try {
		itemNameToLowerCase = item.name.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '').toLowerCase();

		log.verbose(`Adding node for ${item.name}`);
		elements.push({
			group: 'nodes',
			data: {
				id: itemNameToLowerCase,
				name: item.name,
				// imageUrl: item.image,
				color: 'green',
				category: item.category
			}
		});
	} catch (e) {
		log.error(`Problem adding node for ${item.name}`);
		log.error(e);
	}

	// Add edges
	if (item.crafting && item.crafting.length) {
		item.crafting.forEach((recipe) => {

			try {
				recipe.ingredients.forEach((ingredient) => {
					ingredientNameToLowerCase = ingredient.name.replace(/\s/g, '').replace(/\(/g, '').replace(/\)/g, '').toLowerCase();

					// If an ingredient doesn't exist as a node, then add it.
					if (!allItems[ingredientNameToLowerCase]) {
						log.warn(`${ingredient.name} does not exist as a node on the graph.`);

						elements.push({
							group: 'nodes',
							data: {
								id: ingredientNameToLowerCase,
								name: ingredient.name,
								color: 'red'
							}
						});
					}

					log.verbose(`Adding edge ${ingredient.name} -> ${item.name}`);
					elements.push({
						group: 'edges',
						data: {
							id: `${ingredientNameToLowerCase}->${itemNameToLowerCase}`,
							source: ingredientNameToLowerCase,
							target: itemNameToLowerCase
						}
					});
				});
			} catch (e) {
				log.error(`Problem adding edge for recipe: ${JSON.stringify(recipe)}`);
				log.error(e);
			}
		});
	}
});

const cy = window.cy = cytoscape({
	container: document.getElementById('graph'),
	elements,
	style: [ // the stylesheet for the graph
		{
			selector: 'node',
			style: {
				// 'background-image': 'data(imageUrl)',
				'content': 'data(name)',
				'border-color': 'lightgrey',
				'border-width': 3,
				'background-color': 'data(color)'
			}
		},
		{
			selector: 'edge',
			style: {
				'curve-style': 'straight',
				'target-arrow-shape': 'triangle'
			}
		},
		{
			selector: 'edge:selected',
			style: {
				'line-color': 'black',
				'source-arrow-color': 'black',
				'target-arrow-color': 'black',
			}
		},
		{
			selector: 'node:selected',
			style: {
				'border-color': 'black',
				'border-width': '3px',
				'background-color': 'grey'
			}
		},
		{
			selector: 'node:parent',
			style: {
				'background-color': 'lightgrey'
			}
		}
	]
});

var api = cy.viewUtilities({
	highlightStyles: [
		{ node: { 'border-color': '#000000', 'border-width': 3 }, edge: { 'line-color': '#000000', 'source-arrow-color': '#000000', 'target-arrow-color': '#000000', 'width': 3 } },
	],
	selectStyles: {
		node: { 'border-color': 'black', 'border-width': 3, 'background-color': 'lightgrey' },
		edge: { 'line-color': 'black', 'source-arrow-color': 'black', 'target-arrow-color': 'black', 'width': 3 }
	},
	setVisibilityOnHide: false, // whether to set visibility on hide/show
	setDisplayOnHide: true, // whether to set display on hide/show
	zoomAnimationDuration: 1500, //default duration for zoom animation speed
	neighbor: function (node) {
		return node.closedNeighborhood();
	},
	neighborSelectTime: 1000
});

var layout = cy.layoutObject = cy.layout({
	name: 'breadthfirst',

	fit: true, // whether to fit the viewport to the graph
	directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
	padding: 30, // padding on fit
	circle: true, // put depths in concentric circles if true, put depths top down if false
	grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
	spacingFactor: 0, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
	boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
	avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
	nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
	roots: undefined, // the roots of the trees
	maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
	animate: false, // whether to transition the node positions
	animationDuration: 500, // duration of animation in ms if enabled
	animationEasing: undefined, // easing of animation if enabled,
	animateFilter: function (node, i) { return false; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
	ready: undefined, // callback on layoutready
	stop: undefined, // callback on layoutstop
	transform: (node, position) => position // transform a given node position. Useful for changing flow direction in discrete layouts
});

layout.run();

function changeBorder (eles) {
	eles.forEach(function (ele) {
		ele.css('background-color', 'purple');
	});
	return eles;
}

function revertBorder (eles) {
	eles.forEach(function (ele) {
		ele.css('background-color', 'green');
	});
	return eles;
}

document.getElementById('hide').addEventListener('click', function () {
	api.disableMarqueeZoom();
	var nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	revertBorder(nodesWithHiddenNeighbor);
	api.hide(cy.$(':selected'));
	nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	changeBorder(nodesWithHiddenNeighbor);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('showAll').addEventListener('click', function () {
	api.disableMarqueeZoom();
	var nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	revertBorder(nodesWithHiddenNeighbor);
	api.show(cy.elements());
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('showHiddenNeighbors').addEventListener('click', function () {
	api.disableMarqueeZoom();
	var selectedNodes = cy.nodes(':selected');
	var nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	revertBorder(nodesWithHiddenNeighbor);
	api.showHiddenNeighbors(selectedNodes);
	nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	changeBorder(nodesWithHiddenNeighbor);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('zoomToSelected').addEventListener('click', function () {
	api.disableMarqueeZoom();
	var selectedEles = cy.$(':selected');
	api.zoomToSelected(selectedEles);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('marqueeZoom').addEventListener('click', function () {
	//document.getElementById("cy").style.cursor ="crosshair";
	api.enableMarqueeZoom();
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

var tappedBefore;
cy.on('tap', 'node', function (event) {
	var node = this;
	var tappedNow = node;
	setTimeout(function () {
		tappedBefore = null;
	}, 300);
	if (tappedBefore && tappedBefore.id() === tappedNow.id()) {
		tappedNow.trigger('doubleTap');
		tappedBefore = null;
	} else {
		tappedBefore = tappedNow;
	}
});

cy.on('doubleTap', 'node', function (event) {
	/*
	var nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
	revertBorder(nodesWithHiddenNeighbor);
	api.show(cy.nodes(":selected").neighborhood().union(cy.nodes(":selected").neighborhood().parent()));
	nodesWithHiddenNeighbor = cy.edges(":hidden").connectedNodes(':visible');
	changeBorder(nodesWithHiddenNeighbor);
	*/
	api.disableMarqueeZoom();
	var selectedNodes = cy.nodes(':selected');
	var nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	revertBorder(nodesWithHiddenNeighbor);
	api.showHiddenNeighbors(selectedNodes);
	nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes(':visible');
	changeBorder(nodesWithHiddenNeighbor);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('highlightNeighbors').addEventListener('click', function () {
	api.disableMarqueeZoom();
	if (cy.$(':selected').length > 0) {
		var idx = document.getElementById('highlightColors').selectedIndex;
		api.highlightNeighbors(cy.$(':selected'), idx);
	}
});

document.getElementById('highlightElements').addEventListener('click', function () {
	api.disableMarqueeZoom();
	if (cy.$(':selected').length > 0) {
		var idx = document.getElementById('highlightColors').selectedIndex;
		api.highlight(cy.$(':selected'), idx);
	}
});

document.getElementById('removeSelectedHighlights').addEventListener('click', function () {
	api.disableMarqueeZoom();
	if (cy.$(':selected').length > 0)
		api.removeHighlights(cy.$(':selected'));
});

document.getElementById('removeAllHighlights').addEventListener('click', function () {
	api.disableMarqueeZoom();
	api.removeHighlights();
});

document.getElementById('addColorBtn').addEventListener('click', function () {
	let color = getRandomColor();
	let nodeStyle = { 'border-color': color, 'border-width': 3 };
	let edgeStyle = { 'line-color': color, 'source-arrow-color': color, 'target-arrow-color': color, 'width': 3 };
	api.addHighlightStyle(nodeStyle, edgeStyle);
	addHighlightColorOptions();
	document.getElementById('highlightColors').selectedIndex = api.getHighlightStyles().length - 1;
	document.getElementById('colorInp').value = color;
});

document.getElementById('colorChangerBtn').addEventListener('click', function () {
	let color = document.getElementById('colorInp').value;
	var idx = document.getElementById('highlightColors').selectedIndex;
	let nodeStyle = { 'border-color': color, 'border-width': 3 };
	let edgeStyle = { 'line-color': color, 'source-arrow-color': color, 'target-arrow-color': color, 'width': 3 };
	api.changeHighlightStyle(idx, nodeStyle, edgeStyle);

	var opt = document.getElementById('highlightColors').options[idx];
	opt.value = color;
	opt.text = color;
});

document.getElementById('highlightColors').addEventListener('change', function (e) {
	document.getElementById('colorInp').value = e.target.value;
});

addHighlightColorOptions();
var s = api.getHighlightStyles()[0];
if (s) {
	document.getElementById('colorInp').value = s.node['border-color'];
}
function addHighlightColorOptions () {
	var colors = api.getHighlightStyles().map(x => x.node['border-color']);

	document.getElementById('highlightColors').innerHTML = '';

	for (var i = 0; i < colors.length; i++) {
		var o = document.createElement('option');
		o.text = colors[i];
		o.value = colors[i];
		if (i == 0) {
			o.selected = 'selected';
		}
		document.getElementById('highlightColors').appendChild(o);
	}
}

function getRandomColor () {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
