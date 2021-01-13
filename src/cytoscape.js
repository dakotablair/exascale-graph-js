import $ from 'jquery';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import layoutsAvailable from './cytoscapeLayouts';
import kbCytoscape from './kbCytoscape';

/**
 * style data for a cytoscape instance
 *
 * @returns {object[]} styleData
 */
function defaultStyle() {
  return [
    {
      selector: 'node',
      style: {
        'background-color': 'mapData(id.length, 0, 15, #000, #4682b4)',
        shape: 'ellipse', // (ellipse/rectangle/round-diamond),
        'text-halign': 'center',
        'text-outline-color': '#4682b4',
        'text-outline-width': '2px',
        'text-valign': 'center',
      },
    },
    {
      selector: 'node.collected',
      style: {
        'border-width': 4,
        width: 14,
        height: 14,
        'border-style': 'solid',
        'border-color': '#264662',
        'border-opacity': 1,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': '#e77943',
        label: 'data(name)',
      },
    },
    {
      selector: 'node.phenotype',
      style: {
        width: 50,
        height: 50,
        shape: 'round-diamond',
      },
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'font-weight': 'bold',
        'line-color': 'data(edge_type_color)',
        'text-outline-color': 'data(edge_type_color)',
        'text-outline-width': '2px',
        width: 3,
        'z-index': 1,
      },
    },
    {
      selector: 'edge:selected',
      style: {
        label: 'data(edge_type)',
      },
    },
  ];
}

/**
 * generate the configuration for a cytoscape instance. If provided with a containerID, the config
 * will include style, layout, and container data; otherwise it will be assumed to be headless.
 *
 * @param {string} containerID (optional)
 * @returns {object} config - cytoscape configuration object
 */
function cytoscapeConfig(containerID) {
  const config = {
    elements: {
      nodes: [],
      edges: [],
    },
  };

  if (!containerID) {
    config.headless = true;
  }
  // container to render in
  config.container = document.getElementById(`${containerID}--graph`);
  config.style = defaultStyle();
  config.layout = 'null';

  // check the current state of the controls
  const layout_value = $(`#${containerID}--controls select[name=layout]`).length
      ? $(`#${containerID}--controls select[name=layout]`)[0].value || 'null'
      : 'null',
    layouts = layoutsAvailable(),
    radioControls = [
      'userZoomingEnabled',
      'userPanningEnabled',
      'boxSelectionEnabled',
      'selectionType',
    ];

  config.layout = layouts[layout_value];

  radioControls.forEach((r) => {
    let val = $(`input[name=${r}]:checked`).val();
    if (val === '0') {
      val = 0;
    }
    config[r] = val;
  });

  return config;
}

/**
 * creates a cytoscape instance using cytoscapeConfig, with some extra functionality added
 *
 * @param {string} containerID (optional)
 * @returns {cytoscape} cytoscapeInstance - cytoscape instance
 */
function initCytoscape(containerID) {
  if (!containerID) {
    cytoscape.use(popper);
  }
  cytoscape.use(kbCytoscape);
  const config = cytoscapeConfig(containerID),
    cytoscapeInstance = cytoscape(config);

  if (containerID) {
    cytoscapeInstance.layoutSelector = `#${containerID}--controls select[name=layout]`;
  }

  return cytoscapeInstance;
}

export { initCytoscape };
