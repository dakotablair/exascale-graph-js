import $ from 'jquery';
import dt from 'datatables.net-bs';
import buttons from 'datatables.net-buttons';
import buttons_bs from 'datatables.net-buttons-bs';
import columnVisibility from 'datatables.net-buttons/js/buttons.colVis.js';
import buttonsHtml5 from 'datatables.net-buttons/js/buttons.html5.js';
import scroller from 'datatables.net-scroller-bs';
import searchPanes from 'datatables.net-searchpanes-bs';
import select from 'datatables.net-select-bs';

window.jQuery = window.$ = $;
dt(window, $);
buttons(window, $);
buttons_bs(window, $);
columnVisibility(window, $);
buttonsHtml5(window, $);
scroller(window, $);
searchPanes(window, $);
select(window, $);

/**
 * given a column name, supplies the appropriate column header
 *
 * @param {object} schema     schema for the data type in the table
 * @param {string} colName    column name
 * @returns {string} title from the schema or colName
 */
function entitle(schema, colName) {
  if (schema[colName] && schema[colName].title) {
    return schema[colName].title;
  }
  // replace _ with spaces
  const newColName = colName.replace('_', ' ');
  return newColName.charAt(0).toUpperCase() + newColName.slice(1);
}

/**
 * get the button configuration for the given button type
 *
 * @param {string} type
 * @returns {object[]} array containing the button configuration for the button or group of buttons
 */
function buttonConfig(type) {
  const buttonArr = {
    download: [
      {
        text: 'Downloads',
        className: 'disabled',
        enabled: false,
      },
      {
        extend: 'csv',
        text: 'CSV',
        extension: '.csv',
      },
      {
        extend: 'csv',
        text: 'TSV',
        fieldSeparator: '\t',
        extension: '.tsv',
      },
      {
        text: 'JSON',
        // action: function (e, dt, button, config) {
        action: function () {
          $.fn.dataTable.fileSave(
            new Blob([JSON.stringify(dt.buttons.exportData())]),
            'Export.json'
          );
        },
      },
    ],
    nodeCollect: [
      {
        text: 'Collect...',
        className: 'disabled',
        enabled: false,
      },
      {
        name: 'addToCollection',
        text: 'Add selected nodes',
        action: function (e, _dt) {
          return window.kbase.collection.collectSelectedTableNodes(_dt);
        },
      },
      {
        name: 'removeFromCollection',
        text: 'Remove selected nodes',
        action: function (e, _dt) {
          return window.kbase.collection.discardSelectedTableNodes(_dt);
        },
      },
    ],
    edgeCollect: [
      {
        text: 'Collect...',
        className: 'disabled',
        enabled: false,
      },
      {
        name: 'addToCollection',
        text: 'Add nodes in selected edges',
        action: function (e, _dt) {
          return window.kbase.collection.collectSelectedTableEdges(_dt);
        },
      },
      {
        name: 'removeFromCollection',
        text: 'Remove nodes in selected edges',
        action: function (e, _dt) {
          return window.kbase.collection.discardSelectedTableEdges(_dt);
        },
      },
    ],
    select: [
      {
        text: 'Select...',
        className: 'disabled',
        enabled: false,
      },
      {
        extend: 'selectAll',
        text: 'All',
      },
      {
        extend: 'selectNone',
        text: 'None',
      },
      {
        name: 'selectFilter',
        text: 'Filtered',
        action: function (e, _dt) {
          _dt.rows({ search: 'applied' }).select();
        },
      },
    ],
    colvis: [
      {
        extend: 'colvis',
        columns: ':gt(0)',
      },
    ],
    searchPane: [
      {
        extend: 'searchPanes',
        text: 'Faceted search',
      },
    ],
  };

  return buttonArr[type];
}

/**
 * get the list of columns in a table
 *
 * @param {string} type - table type
 * @returns {array} column list
 */
function columnList(type) {
  const cols = {
    collection: ['select', 'id', 'node_type', 'transcript', 'gene_symbol'],
    edge: ['select', 'id', 'source', 'target', 'edge_type', 'score', 'directed'],
    node: [
      'select',
      'id',
      'node_type',
      'transcript',
      'gene_symbol',
      'gene_full_name',
      'edges',
      'view',
    ],
    nodeMetadata: [
      'select',
      'id',
      'node_type',
      'transcript',
      'gene_symbol',
      'gene_full_name',
      'edges',
      'gene_model_type',
      'clusters',
      'tair_computational_description',
      'tair_curator_summary',
      'tair_short_description',
      'go_terms',
      'go_description',
      'mapman_bin',
      'mapman_name',
      'mapman_description',
      'pheno_aragwas_id',
      'pheno_scoring',
      'pheno_pto_name',
      'pheno_pto_description',
      'pheno_reference',
      'user_notes',
      'view',
    ],
  };
  return cols[type];
}

/**
 * set up the dataTables configuration for each column in the table
 *
 * @param {object} schema     schema for the entity type in the table
 * @param {string} type       node, edge, or collection
 * @returns {object[]} array of objects with column config information
 */
function columnConfig(schema, type) {
  const columns =
    type === 'collection' || type === 'node' ? columnList('nodeMetadata') : columnList(type);

  let visibleCols;
  // 'node' and 'collection' pages have all the metadata but it is initially hidden
  if (type === 'collection' || type === 'node') {
    visibleCols = columnList(type);
  }

  const predefinedCols = {
    view: {
      className: 'view',
      data: 'id',
      defaultContent: '',
      orderable: false,
      render: (data, _type) => {
        if (_type === 'display') {
          return '<button class="view_button">Show</button>';
        }
        return '';
      },
      searchable: false,
      title: 'Details',
    },
    select: {
      className: 'select-checkbox', // automatically provided by dataTables css
      data: null,
      defaultContent: '',
      orderable: false,
      targets: 0,
      title: 'Select',
    },
  };

  return columns.map((colName) => {
    const rtnObj = predefinedCols[colName]
      ? predefinedCols[colName]
      : {
          data: colName,
          className: colName,
          title: entitle(schema, colName),
          defaultContent: '',
        };

    // hide the extra metadata columns initially
    if ((type === 'collection' || type === 'node') && visibleCols.indexOf(colName) === -1) {
      rtnObj.visible = false;
    }
    // custom renderer for edges column
    if (colName === 'edges') {
      rtnObj['render'] = (data, _type) => {
        if (!data) {
          return;
        }
        if (_type === 'display') {
          return data.join(', ');
        }
        return data;
      };
    }
    return rtnObj;
  });
}

/**
 * get the search pane config for a given table type
 *
 * @param {string} type
 * @returns {object[]} searchPane configuration
 *
 * Not currently in use
 */
function searchPaneConfig(type) {
  const columns = columnList(type);

  // no filtering on ID
  if (type === 'edge') {
    return columns.map((el, i) => (el === 'ID' ? '' : i)).filter((el) => el);
  }

  const nodeFilterCols = [
    'Node type',
    'Edges',
    //       'Transcript',
    //       'Gene symbol',
    //       'Gene full name',
    'Gene model type',
    'clusters',
    //       'TAIR computational desc',
    //       'TAIR curator summary',
    //       'TAIR short desc',
    'GO terms',
    //       'GO descr',
    'Mapman bin',
    //       'Mapman name',
    //       'Mapman desc',
    'Pheno AraGWAS ID',
    //       'Pheno desc1',
    //       'Pheno desc2',
    //       'Pheno desc3',
    //       'Pheno ref',
    //       'User notes',
  ];
  return columns
    .map((el, i) => (nodeFilterCols.indexOf(el) === -1 ? undefined : i))
    .filter((el) => el);
}

/**
 * format data for display in the expandable section of a table row
 * gene and phenotype objects have different pieces of data provided, so only the relevant fields should be displayed
 *
 * @param {object} schema     schema for the entity type in the table
 * @param {object} d          row data
 * @returns {string} HTML string with data formatted according to what it contains
 */
function formatData(schema, d) {
  const propertyList = {
      gene: [
        'gene_model_type',
        'clusters',
        'tair_computational_description',
        'tair_curator_summary',
        'tair_short_description',
        'go_terms',
        'go_description',
        'mapman_bin',
        'mapman_name',
        'mapman_description',
      ],
      pheno: [
        'pheno_aragwas_id',
        'pheno_scoring',
        'pheno_pto_name',
        'pheno_pto_description',
        'pheno_reference',
      ],
      all: ['user_notes'],
    },
    objProperties = propertyList[d.node_type].concat(propertyList.all);

  let str = '';
  objProperties.forEach((prop) => {
    const name = entitle(schema, prop);
    if (d[prop]) {
      str += `<dt>${name}</dt><dd>${d[prop]}</dd>`;
    }
  });
  if (str !== '') {
    return `<dl class="something">${str}</dl>`;
  }
  return '<p>No information available</p>';
}

/**
 * compile the table configuration for a given table type (node, edge, or collection)
 *
 * @param {object} schema     schema for the entity type in the table
 * @param {string} type       node, edge, or collection
 * @returns {object} tableConfig, ready to initialise a DataTables table!
 */
function tableConfig(schema, type) {
  if (type === 'collection') {
    return {
      columns: columnConfig(schema, type),
      dom: '<"table-top clearfix"fiB>rt<"table-bottom clearfix"l>',
      scrollY: 500,
      order: [[1, 'desc']],
      scrollCollapse: true,
      scroller: true,
      buttons: buttonConfig('colvis').concat(buttonConfig('download')),
    };
  }

  const buttonArr =
    type === 'edge'
      ? buttonConfig('select').concat(buttonConfig('edgeCollect'))
      : buttonConfig('colvis').concat(buttonConfig('select')).concat(buttonConfig('nodeCollect'));

  return {
    columns: columnConfig(schema, type),
    // l - length changing input control
    // f - filtering input
    // t - The table!
    // i - Table information summary
    // p - pagination control
    // r - processing display element
    dom: '<"table-top clearfix"fiB>rt<"table-bottom clearfix"lp>',
    scrollX: true,
    order: [[1, 'desc']],
    paging: true,
    lengthMenu: [
      [25, 50, 100],
      [25, 50, 100],
    ],
    deferRender: true,
    //     searchPanes: searchPaneConfig(type),
    select: {
      style: 'os',
      selector: 'td:first-child',
    },
    rowId: 'id',
    buttons: buttonArr,
  };
}

export { tableConfig, formatData };
