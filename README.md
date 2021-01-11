# kb_cytoscape js

This directory contains the JavaScript UI for kb_cytoscape.

kb_cytoscape js makes use of cytoscape and DataTables, and is built using [rollup](https://rollupjs.org/).

# Development

Run `yarn install` to install the node module dependencies.

To compile the code, run

```sh
yarn run build
```

This will produce compiled JS files in the `dist/` directory.

Running
```
yarn run watch
```

will watch for changes in the JS files and rebuild the output file.

# Code Structure

Files within `src/`:
* `collection.js`: uses cytoscape's 'collection' to create and edit a set of nodes and edges of interest
* `cytoscape.js`: sets up the default configuration for cytoscape and inits cytoscape instances
* `cytoscapeLayouts.js`: various different cytoscape layouts
* `data.js`: data parsing and storage, including reading in the JSON file containing nodes and edges and reformatting the data to make it amenable to cytoscape
* `kbCytoscape.js`: register some KBase-specific cytoscape extension functions
* `main.js`: entrypoint
* `message.js`: emit messages to the user. Not in use as the dataset picker has been removed.
* `table-config.js`: all the fiddly table configuration details. It's out of date with the current schema, which is why some table cells are empty or absent. A lot of it could be generated from the JSON schema for the nodes and edges, rather than being hard-coded.
* `tables.js`: initialise the tables, set up table refreshing when data changes, and add in the button listener for opening/closing the details rows.
* `ui.js`: setting up the UI and adding event listeners to the various UI buttons

# TODO

* At present, there is no test runner set up, so the tests do not work.
* DataTables renders the table head at a different width to the table. Fix this!
* Add tooltips to nodes / edges.
* Update `table-config.js` to use the schema directly.