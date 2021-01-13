import $ from 'jquery';
import layoutsAvailable from './cytoscapeLayouts';
import { loadData } from './data';

/**
 * listen to click events on '#dataset--button' and load the data
 */
function addDatasetSelector() {
  $('#dataset--button').on('click keypress', () => {
    loadData();
    console.log('data loaded. cy:', window.kbase.cy); // eslint-disable-line no-console
  });
}

/**
 * populate the options for the layout selector from the available layouts
 * @returns {object} layouts - the layouts available
 */
function addLayoutSelector() {
  const layouts = layoutsAvailable(),
    // insert an options element with each of the layouts above
    layoutArray = Object.keys(layouts).map((layout, i) => {
      return `<option value="${layout}"${i ? '' : ' selected'}>${layout}</option>`;
    }),
    layoutString = layoutArray.join('\n');
  $('#layout--select').html(layoutString);
  return layouts;
}

/**
 * add listeners to the UI elements in '#cy--controls' to enable graph interactivity
 * @function
 */
function activateControls() {
  addLayoutSelector();
  addDatasetSelector();

  // response to button events
  $('#cy--controls').on('click keypress', 'button', (e) => {
    // UI elements have 'action' and 'target' data attributes,
    // which are used to instruct the JS to run certain functions.
    // For example:
    //   <button id="select_neighbourhood--button" class="btn"
    //     data-action="getNeighbourhood"
    //     data-target="cy">
    //       Get neighbourhood of selected nodes
    //   </button>
    // Clicking this button runs window.kbase.cy.getNeighbourhood()
    const dataAttr = e.target.dataset,
      action = dataAttr['action'],
      target = dataAttr['target'];
    if (target === 'cy') {
      window.kbase[target][action]();
    }
  });

  // respond to input element events
  $('#cy--controls').on('click keypress change', 'input', (e) => {
    const dataAttr = e.target.dataset,
      action = dataAttr['action'],
      target = dataAttr['target'],
      { value } = e.target;
    if (target === 'cy') {
      window.kbase[target][action](value);
    }
  });

  // respond to select element events
  $('#cy--controls').on('change', 'select', (e) => {
    const dataAttr = e.target.dataset,
      action = dataAttr['action'],
      target = dataAttr['target'],
      { value } = e.target;
    if (target === 'cy') {
      window.kbase[target][action](value);
    }
  });

  // when the graph tab is going to be shown, render the graph
  $('#navigation a[data-toggle="tab"]').on('show.bs.tab', (e) => {
    if (e.target.id === 'graph-tab') {
      window.kbase.cy.renderData(window.kbase.data);
      // remove event listener
      $('#navigation a[data-toggle="tab"]').off('show.bs.tab');
    }
  });

  // when the graph tab has been shown, (try to) fit the graph to the display
  $('#navigation a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
    if (e.target.id === 'graph-tab') {
      // make sure that the graph is visible
      // FIXME: this doesn't seem to work!
      window.kbase.cy.fit();
      // remove event listener
      $('#navigation a[data-toggle="tab"]').off('shown.bs.tab');
    }
  });

  console.log('Controls activated'); // eslint-disable-line no-console
}

export { activateControls };
