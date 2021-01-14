import * as d3 from 'd3-fetch'; // d3.text, d3.json
import { refreshTable } from './tables';

/**
 * object that stores node and edge data, with a couple of utility functions
 *
 * @returns {object} dataObject
 */
function dataObject() {
  const color_palette = ['#210', '#c16', '#6ba', '#5ef', '#408', '#29d', '#f93', '#fdc'];
  const label_palette = ['#fff', '#fff', '#000', '#000', '#fff', '#fff', '#000', '#000'];
  const colors_assigned = {};
  const colors = (edge_type) => {
    if (edge_type in colors_assigned) {
      return colors_assigned[edge_type];
    }
    const n_colors = Object.keys(colors_assigned).length;
    const color = color_palette[n_colors % color_palette.length];
    colors_assigned[edge_type] = color;
    console.log('colors_assigned', colors_assigned); // eslint-disable-line no-console
    return color;
  };
  return {
    node: {},
    edge: {},
    nodeEdge: {},
    collection: {},
    nodeArr: function () {
      return Object.keys(this.nodeEdge).map((el) => {
        return {
          data: {
            id: el,
            name: el.split('/')[1],
          },
        };
      });
    },
    edgeArr: function () {
      return Object.values(this.edge).map((el) => {
        const edge_type_color = colors(el.edge_type);
        const label_color = label_palette[color_palette.indexOf(edge_type_color)];
        return {
          data: {
            ...el,
            edge_type_color,
            label_text_color: label_color,
          },
        };
      });
    },
  };
}

/**
 * parse a data dump and extract the useful data, separated into nodes and edges.
 * only edges from datasets
 *
 * @param {object} allData
 * @param {string[]} edgeTypes - array of edge types to filter on
 * @returns {object} data - parsed, organised data
 */
function extractData(allData, edgeTypes = null) {
  const inputData = allData.pop();

  // keys are edges, nodes

  const data = dataObject();

  const nodeType = ['_from', '_to'];

  // add all edges
  inputData['edges'].forEach((d) => {
    if (!edgeTypes || (edgeTypes && edgeTypes.indexOf(d.type) !== -1)) {
      // cytoscape uses 'source' and 'target' instead of '_to' / '_from'
      d.source = d._from;
      d.target = d._to;
      d.data_type = 'edge';
      d.id = d._id;
      data.edge[d._id] = d;

      nodeType.forEach((n) => {
        data.nodeEdge[d[n]] ? data.nodeEdge[d[n]].push(d._id) : (data.nodeEdge[d[n]] = [d._id]);
      });
    }
  });

  // add node (pheno and gene) data
  inputData['nodes'].forEach((d) => {
    d.data_type = 'node';
    d.id = d._id;
    // add in edge data (if available)
    if (data.nodeEdge[d._id]) {
      d.edge = data.nodeEdge[d._id];
    }
    // make sure the GO terms are presented reasonably
    if (d.go_terms && d.go_terms.length > 0) {
      d.go_ids = d.go_terms;
      d.go_terms = d.go_ids.sort().join(', ');
    }
    data.node[d._id] = d;
  });

  // ensure that all nodes used in the edges are present in data.node
  Object.keys(data.nodeEdge).forEach((n) => {
    if (!data.node[n]) {
      console.error(`no node data for ${n}`); // eslint-disable-line no-console
    }
  });
  return data;
}

/**
 * Populate tables and window data store with data
 *
 * @param {object} data
 */
function renderData(data) {
  refreshTable();

  console.log(`Found ${data.nodeArr().length} connected nodes and ${data.edgeArr().length} edges`); // eslint-disable-line no-console

  // set the collection data
  window.kbase.collection.data(data);
}

/**
 * load one or more datasets by AJAX from a JSON file, extract and process the data,
 * and use it to populate the display
 */
function loadData() {
  // d3.json, d3.text
  const dataFiles = [
    [
      // TODO: Load up the data config here instead of having it hard-coded?
      // 'data_config.json',
      // 'json',
      'dataset.json',
      'json',
    ],
  ];
  Promise.all(dataFiles.map((v) => d3[v[1]](v[0]))).then((allFileData) => {
    const data = extractData(allFileData);
    window.kbase.data = data;
    renderData(data);
  });
}

export { loadData, dataObject };
