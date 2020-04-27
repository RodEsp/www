// TODO: Change layout to breadthtraversal on unselected hidden
/* cy.layout({
    name:'breadthfirst',
    fit: 'true',
    spacingFactor: .3,
    directed: true,
    maximal: true,
    animate: true
}).run() */

import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import klay from 'cytoscape-klay';
import cyUR from 'cytoscape-undo-redo';
import cyViewUtilities from 'cytoscape-view-utilities';
import ulog from 'ulog';

import craftingdata from './craftingdata.json';

cyViewUtilities(cytoscape);
cyUR(cytoscape);
cytoscape.use(klay);
cytoscape.use(fcose);

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
				'background-color': 'green'
			}
		}
	]
});

const api = cy.viewUtilities({
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
	neighbor: (node) => node.closedNeighborhood(),
	neighborSelectTime: 1000
});

const ur = cy.undoRedo();

const layout = cy.layoutObject = cy.layout({
	name: 'klay',

	nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
	fit: true, // Whether to fit
	padding: 20, // Padding on fit
	animate: false, // Whether to transition the node positions
	animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
	animationDuration: 500, // Duration of animation in ms if enabled
	animationEasing: undefined, // Easing of animation if enabled
	transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
	ready: undefined, // Callback on layoutready
	stop: undefined, // Callback on layoutstop
	klay: {
		// Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
		addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
		aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
		borderSpacing: 20, // Minimal amount of space to be left to the border
		compactComponents: true, // Tries to further compact components (disconnected sub-graphs).
		crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
		/* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
		INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
		cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
		/* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
		INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
		direction: 'RIGHT', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
		/* UNDEFINED, RIGHT, LEFT, DOWN, UP */
		edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
		edgeSpacingFactor: 0.95, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
		feedbackEdges: true, // Whether feedback edges should be highlighted by routing around the nodes.
		fixedAlignment: 'BALANCED', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
		/* NONE Chooses the smallest layout from the four possible candidates.
		LEFTUP Chooses the left-up candidate from the four possible candidates.
		RIGHTUP Chooses the right-up candidate from the four possible candidates.
		LEFTDOWN Chooses the left-down candidate from the four possible candidates.
		RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
		BALANCED Creates a balanced layout from the four possible candidates. */
		inLayerSpacingFactor: 0.5, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
		layoutHierarchy: true, // Whether the selected layouter should consider the full hierarchy
		linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
		mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
		mergeHierarchyCrossingEdges: false, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
		nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
		/* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
		LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
		INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
		nodePlacement: 'LINEAR_SEGMENTS', // Strategy for Node Placement
		/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
		LINEAR_SEGMENTS Computes a balanced placement.
		INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
		SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
		randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
		routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
		separateConnectedComponents: true, // Whether each connected component should be processed separately
		spacing: 20, // Overall setting for the minimal amount of space to be left between objects
		thoroughness: 777 // How much effort should be spent to produce a nice layout..
	},
	priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled

	// name: 'fcose',

	// quality: 'default', 				// 'draft', 'default' or 'proof' | "draft" only applies spectral layout | "default" improves the quality with incremental layout (fast cooling rate) | "proof" improves the quality with incremental layout (slow cooling rate) 
	// randomize: true,					// Use random node positions at beginning of layout, if this is set to false, then quality option must be "proof"
	// animate: true,						// Whether or not to animate the layout
	// animationDuration: 1000,			// Duration of animation in ms, if enabled
	// animationEasing: undefined,			// Easing of animation, if enabled
	// fit: true,							// Fit the viewport to the repositioned nodes
	// padding: 30,						// Padding around layout
	// nodeDimensionsIncludeLabels: true,	// Whether to include labels in node dimensions. Valid in "proof" quality
	// uniformNodeDimensions: true,		// Whether or not simple nodes (non-compound nodes) are of uniform dimensions
	// packComponents: true,				// Whether to pack disconnected components - valid only if randomize: true
	// /* spectral layout options */
	// samplingType: true,					// False for random, true for greedy sampling
	// sampleSize: 25,						// Sample size to construct distance matrix
	// nodeSeparation: 75,					// Separation amount between nodes
	// piTol: 0.0000001,					// Power iteration tolerance
	// /* incremental layout options */
	// nodeRepulsion: 50000,				// Node repulsion (non overlapping) multiplier
	// idealEdgeLength: 50,				// Ideal edge (non nested) length
	// edgeElasticity: 0.01,				// Divisor to compute edge forces
	// nestingFactor: 0.1,					// Nesting factor (multiplier) to compute ideal edge length for nested edges
	// numIter: 2500,						// Maximum number of iterations to perform
	// tile: true,							// For enabling tiling
	// tilingPaddingVertical: 10,			// Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
	// tilingPaddingHorizontal: 10,		// Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
	// gravity: 0.25,						// Gravity force (constant)
	// gravityRangeCompound: 1.5,			// Gravity range (constant) for compounds
	// gravityCompound: 1.0,				// Gravity force (constant) for compounds
	// gravityRange: 3.8,					// Gravity range (constant)
	// initialEnergyOnIncremental: 0.3,	// Initial cooling factor for incremental layout
	// /* layout event callbacks */
	// ready: () => { }, 					// on layoutready
	// stop: () => { } 					// on layoutstop
});

layout.run();

function thickenBorder (eles) {
	eles.forEach((ele) => { ele.css('background-color', 'purple'); });
	eles.data('thickBorder', true);
	return eles;
}
// Decrease border width when hidden neighbors of the nodes become visible
function thinBorder (eles) {
	eles.forEach((ele) => { ele.css('background-color', 'data(color)'); });
	eles.removeData('thickBorder');
	return eles;
}
ur.action('thickenBorder', thickenBorder, thinBorder);
ur.action('thinBorder', thinBorder, thickenBorder);

document.getElementById('searchButton').addEventListener('click', () => {
	api.disableMarqueeZoom();
	const searchTerm = document.getElementById('searchBox').value.toLowerCase().replace(/\s/g, '');
	const selectedEles = cy.$(`#${searchTerm}`);
	api.zoomToSelected(selectedEles);
});

document.getElementById('searchBox').addEventListener('keyup', function (event) {
	// Number 13 is the "Enter" key on the keyboard
	if (event.keyCode === 13) {
		// Cancel the default action, if needed
		event.preventDefault();
		// Trigger the button element with a click
		document.getElementById('searchButton').click();
	}
});

//In below functions, finding the nodes to hide/show are sample specific.
//If the sample graph changes, those calculations may also need a change.
document.getElementById('hide').addEventListener('click', () => {
	api.disableMarqueeZoom();
	const actions = [];
	const nodesToHide = cy.$(':selected').add(cy.$(':selected').nodes().descendants());
	let nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes().intersection(nodesToHide);
	actions.push({ name: 'thinBorder', param: nodesWithHiddenNeighbor });
	actions.push({ name: 'hide', param: nodesToHide });
	nodesWithHiddenNeighbor = nodesToHide.neighborhood(':visible')
		.nodes().difference(nodesToHide).difference(cy.nodes('[thickBorder]'));
	actions.push({ name: 'thickenBorder', param: nodesWithHiddenNeighbor });
	cy.undoRedo().do('batch', actions);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('hideUnselected').addEventListener('click', () => {
	api.disableMarqueeZoom();
	const actions = [];
	const nodesToHide = cy.$(':unselected').add(cy.$(':unselected').nodes().descendants());
	let nodesWithHiddenNeighbor = cy.edges(':hidden').connectedNodes().intersection(nodesToHide);
	actions.push({ name: 'thinBorder', param: nodesWithHiddenNeighbor });
	actions.push({ name: 'hide', param: nodesToHide });
	nodesWithHiddenNeighbor = nodesToHide.neighborhood(':visible')
		.nodes().difference(nodesToHide).difference(cy.nodes('[thickBorder]'));
	actions.push({ name: 'thickenBorder', param: nodesWithHiddenNeighbor });
	cy.undoRedo().do('batch', actions);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('showAll').addEventListener('click', () => {
	api.disableMarqueeZoom();
	const actions = [];
	const nodesWithHiddenNeighbor = cy.nodes('[thickBorder]');
	actions.push({ name: 'thinBorder', param: nodesWithHiddenNeighbor });
	actions.push({ name: 'show', param: cy.elements() });
	ur.do('batch', actions);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('showHiddenNeighbors').addEventListener('click', () => {

	/*
	const hiddenEles = cy.$(":selected").neighborhood().filter(':hidden');
	const actions = [];
	const nodesWithHiddenNeighbor = (hiddenEles.neighborhood(":visible").nodes("[thickBorder]"))
		.difference(cy.edges(":hidden").difference(hiddenEles.edges().union(hiddenEles.nodes().connectedEdges())).connectedNodes());
	actions.push({name: "thinBorder", param: nodesWithHiddenNeighbor});
	actions.push({name: "show", param: hiddenEles.union(hiddenEles.parent())});
	nodesWithHiddenNeighbor = hiddenEles.nodes().edgesWith(cy.nodes(":hidden").difference(hiddenEles.nodes()))
		.connectedNodes().intersection(hiddenEles.nodes());
	actions.push({name: "thickenBorder", param: nodesWithHiddenNeighbor});*/

	api.disableMarqueeZoom();
	const hiddenEles = cy.$(':selected').neighborhood().filter(':hidden');
	const selectedNodes = cy.nodes(':selected');
	let nodesWithHiddenNeighbor = (hiddenEles.neighborhood(':visible').nodes('[thickBorder]'))
		.difference(cy.edges(':hidden').difference(hiddenEles.edges().union(hiddenEles.nodes().connectedEdges())).connectedNodes());

	const actions = [];
	actions.push({ name: 'thinBorder', param: nodesWithHiddenNeighbor });
	actions.push({ name: 'showHiddenNeighbors', param: selectedNodes });

	nodesWithHiddenNeighbor = hiddenEles.nodes().edgesWith(cy.nodes(':hidden').difference(hiddenEles.nodes()))
		.connectedNodes().intersection(hiddenEles.nodes());
	actions.push({ name: 'thickenBorder', param: nodesWithHiddenNeighbor });

	cy.undoRedo().do('batch', actions);
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

document.getElementById('marqueeZoom').addEventListener('click', () => {
	api.enableMarqueeZoom();
	if (document.getElementById('layout').checked) {
		layout.run();
	}
});

let tappedBefore;
cy.on('tap', 'node', (event) => {
	const node = this;
	const tappedNow = node;
	setTimeout(() => {
		tappedBefore = null;
	}, 300);
	if (tappedBefore && tappedBefore.id() === tappedNow.id()) {
		tappedNow.trigger('doubleTap');
		tappedBefore = null;
	} else {
		tappedBefore = tappedNow;
	}
});

cy.on('doubleTap', 'node', (event) => {
	api.disableMarqueeZoom();
	const hiddenEles = cy.$(':selected').neighborhood().filter(':hidden');
	const selectedNodes = cy.nodes(':selected');
	let nodesWithHiddenNeighbor = (hiddenEles.neighborhood(':visible').nodes('[thickBorder]')).difference(cy.edges(':hidden').difference(hiddenEles.edges().union(hiddenEles.nodes().connectedEdges())).connectedNodes());
	const actions = [];
	actions.push({ name: 'thinBorder', param: nodesWithHiddenNeighbor });

	actions.push({ name: 'showHiddenNeighbors', param: selectedNodes });

	nodesWithHiddenNeighbor = hiddenEles.nodes().edgesWith(cy.nodes(':hidden').difference(hiddenEles.nodes()))
		.connectedNodes().intersection(hiddenEles.nodes());
	actions.push({ name: 'thickenBorder', param: nodesWithHiddenNeighbor });

	cy.undoRedo().do('batch', actions);


	/* const hiddenEles = cy.$(":selected").neighborhood().filter(':hidden');
	const actions = [];
	const nodesWithHiddenNeighbor = (hiddenEles.neighborhood(":visible").nodes("[thickBorder]"))
		.difference(cy.edges(":hidden").difference(hiddenEles.edges().union(hiddenEles.nodes().connectedEdges())).connectedNodes());
	actions.push({name: "thinBorder", param: nodesWithHiddenNeighbor});
	actions.push({name: "show", param: hiddenEles.union(hiddenEles.parent())});
	nodesWithHiddenNeighbor = hiddenEles.nodes().edgesWith(cy.nodes(":hidden").difference(hiddenEles.nodes()))
		.connectedNodes().intersection(hiddenEles.nodes());
	actions.push({name: "thickenBorder", param: nodesWithHiddenNeighbor});
	cy.undoRedo().do("batch", actions); */
});

document.getElementById('highlightNeighbors').addEventListener('click', () => {
	if (cy.$(':selected').length > 0) {
		ur.do('highlightNeighbors', { eles: cy.$(':selected'), idx: document.getElementById('highlightColors').selectedIndex });
	}
});

document.getElementById('highlightElements').addEventListener('click', () => {
	if (cy.$(':selected').length > 0) {
		ur.do('highlight', { eles: cy.$(':selected'), idx: document.getElementById('highlightColors').selectedIndex });
	}
});

document.getElementById('removeSelectedHighlights').addEventListener('click', () => {
	if (cy.$(':selected').length > 0)
		ur.do('removeHighlights', cy.$(':selected'));
});

document.getElementById('removeAllHighlights').addEventListener('click', () => {
	ur.do('removeHighlights');
});

document.getElementById('highlightColors').addEventListener('change', (e) => {
	document.getElementById('colorInp').value = e.target.value;
});

document.getElementById('colorChangerBtn').addEventListener('click', () => {
	let color = document.getElementById('colorInp').value;
	const idx = document.getElementById('highlightColors').selectedIndex;
	let nodeStyle = { 'border-color': color, 'border-width': 3 };
	let edgeStyle = { 'line-color': color, 'source-arrow-color': color, 'target-arrow-color': color, 'width': 3 };
	api.changeHighlightStyle(idx, nodeStyle, edgeStyle);

	const opt = document.getElementById('highlightColors').options[idx];
	opt.value = color;
	opt.text = color;
});

document.getElementById('addColorBtn').addEventListener('click', () => {
	let color = getRandomColor();
	let nodeStyle = { 'border-color': color, 'border-width': 3 };
	let edgeStyle = { 'line-color': color, 'source-arrow-color': color, 'target-arrow-color': color, 'width': 3 };
	api.addHighlightStyle(nodeStyle, edgeStyle);
	addHighlightColorOptions();
	document.getElementById('highlightColors').selectedIndex = api.getHighlightStyles().length - 1;
	document.getElementById('colorInp').value = color;
});

addHighlightColorOptions();
const s = api.getHighlightStyles()[0];
if (s) {
	document.getElementById('colorInp').value = s.node['border-color'];
}
function addHighlightColorOptions () {
	const colors = api.getHighlightStyles().map(x => x.node['border-color']);

	document.getElementById('highlightColors').innerHTML = '';

	for (let i = 0; i < colors.length; i++) {
		const o = document.createElement('option');
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

document.addEventListener('keydown', (e) => {
	if (e.ctrlKey) {
		if (e.which === 90)
			ur.undo();
		else if (e.which === 89)
			ur.redo();
	}
});
