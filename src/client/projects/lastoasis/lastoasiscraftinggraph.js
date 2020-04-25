import cytoscape from 'cytoscape';
import ulog from 'ulog'

import craftingdata from './craftingdata.json';

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

		log.info(`Adding node for ${item.name}`);
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

					log.info(`Adding edge ${ingredient.name} -> ${item.name}`);
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

cytoscape({
	container: document.getElementById('graph'),
	elements,
	style: [ // the stylesheet for the graph
		{
			selector: 'node',
			style: {
				'label': 'data(name)',
				'background-color': 'data(color)',
				'shape': 'round-rectangle',
			}
		},
		// {
		// 	selector: 'node[imageUrl]',
		// 	style: {
		// 		'background-image': (ele) => `https://cors-anywhere.herokuapp.com/${ele.data('imageUrl')}`,
		// 		// 'background-image': 'data(imageUrl)',
		// 		'background-fit': 'contain',
		// 		'background-clip': 'none',
		// 		'background-repeat': 'no-repeat',
		// 		'background-opacity': .5
		// 	}
		// },
		{
			selector: 'edge',
			style: {
				'width': 3,
				'line-color': '#ccc',
				'target-arrow-color': '#ccc',
				'target-arrow-shape': 'triangle',
				'mid-target-arrow-color': '#fff',
				'mid-target-arrow-shape': 'triangle'
			}
		}
	],
	layout: {
		name: 'breadthfirst',
		fit: true, // whether to fit the viewport to the graph
		directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
		padding: 10, // padding on fit
		circle: true, // put depths in concentric circles if true, put depths top down if false
		grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
		spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
		// boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
		nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
		// roots: undefined, // the roots of the trees
		maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
		animate: false, // whether to transition the node positions
		animationDuration: 500, // duration of animation in ms if enabled
		// animationEasing: undefined, // easing of animation if enabled,
		// animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
		// ready: undefined, // callback on layoutready
		// stop: undefined, // callback on layoutstop
		transform: (node, position) => position // transform a given node position. Useful for changing flow direction in discrete layouts
	}
});
