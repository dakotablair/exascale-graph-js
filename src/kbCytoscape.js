import $ from 'jquery';
import layoutsAvailable from './cytoscapeLayouts';

/**
 * registers a set of kbase-specific shortcuts on cytoscape
 *
 * @param {cytoscape} cytoscape object
 */
function registerExtensions(cytoscape) {
  // check whether or not cytoscape has already been modified
  if (typeof cytoscape('core', 'getSelectedNodes') === 'function') {
    return;
  }

  /**
   * get the currently-selected nodes from the graph
   *
   * @return {cytoscapeCollection} cytoscape collection containing selected nodes
   */

  cytoscape('core', 'getSelectedNodes', function () {
    return this.filter((n) => n.isNode() && n.selected());
  });

  /**
   * select all nodes in the graph
   *
   * @return {cytoscape} cytoscape object
   */
  cytoscape('core', 'selectAllNodes', function () {
    this.nodes().forEach((n) => n.select());
    return this;
  });

  /**
   * deselect all nodes in the graph
   *
   * @return {cytoscape} cytoscape object
   */
  cytoscape('core', 'deselectAllNodes', function () {
    this.nodes().forEach((n) => n.unselect());
    return this;
  });

  /**
   * invert the selected nodes in the graph
   *
   * @return {cytoscape} cytoscape object
   */
  cytoscape('core', 'invertNodeSelection', function () {
    this.nodes().forEach((n) => (n.selected() ? n.unselect() : n.select()));
    return this;
  });

  /**
   * gets the neighbourhood of each selected node
   * expand the current selection to include all nodes one edge away from a selected node
   *
   * @return {cytoscape} cytoscape object
   */
  cytoscape('core', 'getNeighbourhood', function () {
    this.getSelectedNodes().neighbourhood().select();
    return this;
  });

  /**
   * 'collect' the node, i.e. add the class "collected" to the node
   * @param {string} id - the ID of the node to be updated
   * @return {cytoscapeNode} cytoscape node that has been updated
   */
  cytoscape('core', 'collectNode', function (id) {
    const node = this.getElementById(id);
    if (node) {
      node.addClass('collected');
    }
    return node;
  });

  /**
   * 'collect' all selected nodes in the graph
   * see 'collectNode' for what "collecting" a node entails
   * @return {cytoscapeCollection} cytoscape nodes that have been updated
   */
  cytoscape('core', 'collectSelectedGraphNodes', function () {
    return this.getSelection().addClass('collected');
  });

  /**
   * discard the node by removing the class "collected" from it
   * @param {string} id - the ID of the node to be updated
   * @return {cytoscapeNode} cytoscape node that has been updated
   */
  cytoscape('core', 'discardNode', function (id) {
    const node = this.getElementById(id);
    if (node) {
      node.removeClass('collected');
    }
    return node;
  });

  /**
   * 'discard' all selected nodes in the graph
   * see 'discardNode' for what "discarding" a node entails
   * @return {cytoscapeCollection} cytoscape nodes that have been updated
   */
  cytoscape('core', 'discardSelectedGraphNodes', function () {
    return this.getSelection().removeClass('collected');
  });

  /**
   * run the layout algorithm on the graph, updating the current layout first if necessary
   *
   * @param {string} value - the name of the layout to run
   * @return {cytoscape} cytoscape object
   */
  cytoscape('core', 'setLayout', function (value) {
    const layouts = layoutsAvailable();
    if (layouts[value] || value === 'null') {
      this.layout(layouts[value]).run();
    }
    return this;
  });

  const registerNodeHandlers = (nodes) => {
    console.log(`register node handlers for ${nodes.length} nodes`); // eslint-disable-line no-console
    /*
    nodes.forEach((node) => {
      const popper = node.popper({
        content: () => {
          const div = document.createElement('div');

          div.innerHTML = 'asdf';
          div.id = 'node-node';

          document.body.appendChild(div);

          return div;
        },
      });
      node.on('click', () => {});
      const update = () => popper.update();
      kbase.cy.on('zoom pan', update);
      node.on('position', update);
    });
    */
  };

  /**
   * add the supplied data to the chart, and run the layout if the container is defined
   *
   * @param {object} data
   * @return {cytoscape} cytoscape object
   */
  cytoscape('core', 'renderData', function (data) {
    // add any canvas/node/edge handlers here
    console.log('data', data); // eslint-disable-line no-console
    if (this.nodes()) {
      this.nodes().remove();
    }
    if (data && data.nodeArr() && data.edgeArr()) {
      this.add({ nodes: data.nodeArr(), edges: data.edgeArr() });
      console.log('nodes', this.nodes); // eslint-disable-line no-console
      registerNodeHandlers(this.nodes);
      if (this.container !== null) {
        // get the current layout
        const layoutValue = $(this.layoutSelector)[0].value || 'null';
        this.setLayout(layoutValue);
      }
    }
    return this;
  });
}

const kbCytoscape = function (cytoscape) {
  // can't register if cytoscape unspecified
  if (!cytoscape) {
    return;
  }
  registerExtensions(cytoscape);
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  kbCytoscape(cytoscape); // eslint-disable-line no-undef
}

export default kbCytoscape;
