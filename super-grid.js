require([
	'dojo/_base/declare',
	'dojo/dom-class',
	'dojo/dom-construct',
	'dstore/Memory',
	'dstore/Trackable',
	'dstore/Tree',
	'dgrid/Grid',
	'dgrid/Tree',
	'dgrid/Selection',
	'lib/Editor',
	'dgrid/OnDemandGrid',
	'dgrid/Selector',
], function (declare, domClass, domConstruct, Memory, Trackable, TreeStoreMixin, Grid, Tree, Selection, Editor, OnDemandGrid, Selector) {
	function createStore(data) {
		this.store = new(declare([Memory, Trackable, TreeStoreMixin]))({
			data: data
		});
	}
	if (Handlebars) {
		Handlebars.registerHelper('ifvalue', function (conditional, options) {
			if (options.hash.value === conditional) {
				return options.fn(this)
			} else {
				return options.inverse(this);
			}
		})
	}



	function createGrid() {
		var _this = this;

		//Holding array for all the Classes we have to mixin
		var mixins = [];

		//checking whether the grid is tree or not
		_this.isTree=false;
		_this.fireExpand=false;
		//Decide which mixins to push based on the Host Element's Attributes


		//_this.getAttribute('selection') ? mixins.push(Selection) : null;

		//These have to pushed inspite of not getting defined in the Attributes
		mixins.push(OnDemandGrid);
		mixins.push(Selector);
		mixins.push(Editor);

		_this.tree ? (function(){
			_this.isTree=true
			mixins.push(Tree);
		})() : _this.isTree=false;


		//Create a new instance of dgrid. For later purposes we are storing
		//the instance as an DOM Fproperty of the hsot element so it can
		//retrieved as Element.dgrid
		_this.dgrid = new declare(mixins)({

			//rendering expansion of tree leads to selection of the checkbox of the same row, to avoid this
 			// we set the selectionMode to 'none'
			selectionMode: 'none',
			columns: _this.columnStructure,
			collection: _this.store

		});



		//Finally append the dGrid instance to the Host DOM.
		_this.appendChild(_this.dgrid.domNode);

		//Render the dgrid according to the value of the host DOM.
		//_this.dgrid.renderArray(_this.value)

	}





	//This function parses the <super-grid>'s children to find all
	//<super-column>s. Based on what it finds, a column object is built.
	//This column object is required by dGrid for making columns.
	function getColumnStructure() {
		var _this = this;
		var columns = [];


		Array.prototype.slice.call(_this.querySelectorAll('super-column')).forEach(function(superColumn) {
			var column = {
				field: superColumn.getAttribute('field'),
				label: superColumn.getAttribute('label') || superColumn.getAttribute('field'),
				className: superColumn.getAttribute('className') || '',
				sortable: superColumn.getAttribute('sortable') ? true : false,

			};



			var template = '';

			//We have an editor tag defined within <template> </template>
			if (template = superColumn.querySelector('template[data-editor]')) {

				//Convert something like -> 'a <paper-input> Hello </paper-input>' to -> 'paper-input'
				var patt = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/
				var editor = template.innerHTML.match(patt)[0].split('<')[1].split('>')[0];
				column.editor = editor;
			}

			//If the <template> isn't inside an editor then its a case of
			//rendering our dGrid cell in a custom way using Handlebars templates
			else if (template = superColumn.querySelector('template')) {
				column.renderCell = function(object, value, node, options) {

					//A holding div to convert the contents of the <template>
					//from string to DOM. Then return the DOM accoridng to
					//renderCell's specification.
					var div = document.createElement('div');

					//Handlebars has to be defined on the doc where super-grid is running.
					if (Handlebars) {
						div.innerHTML = Handlebars.compile(template.innerHTML)(object);

					}
					//If Handlebars isn't defined, simply dump the output as is.
					else {
						div.innerHTML = template.innerHTML
					}
					return div.children[0];
				}
			}

			column.selector = superColumn.getAttribute('selector') == 'checkbox' ? "checkbox" : null;


			if (superColumn.getAttribute('renderExpando') == 'true') {
				column.renderExpando = true;

			}
			columns.push(column)
		})
		return columns;
	}

	Polymer({
		is: "super-grid",
		ready: function () {

		},
		_triggerEvents: function () {
			var self = this
			this.dgrid.on('dgrid-select', function (e) {
				self.fire('select', e)
			})
		},
		attachCellClickHandler: function(){
			var self = this
			this.dgrid.on('.dgrid-cell:click', function (e) {
					var cell = self.dgrid.cell(e);

					self.fire('cellClick', cell);


					if(cell.column.renderExpando)
					{
						self.fire('expand', cell);
					}


    	})
		},
		created: function() {
			this.columnStructure = getColumnStructure.call(this);
		},
		attached: function() {
			createStore.call(this, []);
			createGrid.call(this);
			this._triggerEvents();
			this.attachCellClickHandler();
			this.removeHeader ? this.dgrid.set('showHeader', false) : this.dgrid.set('showHeader', true);


			if(this.selectionMode == 'none'){
				this.dgrid.set('selectionMode', 'none');
			}
			else if (this.selectionMode == 'single') {
				this.dgrid.set('selectionMode', 'single');
			}
			else if (this.selectionMode == 'extended') {
				this.dgrid.set('selectionMode', 'extended');
			}
			else if (this.selectionMode == 'multiple') {
				this.dgrid.set('selectionMode', 'multiple');
			}
			else if (this.selectionMode == 'toggle') {
				this.dgrid.set('selectionMode', 'toggle');
			}

		},
		allowSelect: function(row){
			this.dgrid.allowSelect(row);
		},
		selectAll: function(){
			this.dgrid.selectAll();
		},
		select: function(row ,toRow){
			this.dgrid.select(row,toRow);
		},
		deselect: function(row,toRow){
			this.dgrid.deselect(row,toRow);
		},
		clearSelection: function(){
			this.dgrid.clearSelection();
		},
		isSelected: function(row){
			this.dgrid.isSelected(row);
		},
		get selected () {
			var self = this
			return this.value.filter(function (value){
				return Object.keys(self.dgrid.selection).some(function(selection) {
					return (selection == value.id)
				})
			})
		},
		properties: {
			tree: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			dgrid: {
				type: "Object"
			},
			selectionMode: {
				type: "String"
			},
			allowTextSelection: {
				type: "String",
			},
			deselectOnRefresh: {
				type: Boolean,
				value: true
			},
			loadingMessage: {
				type: "String"
			},
			noDataMessage: {
				type: "String"
			},
			allowSelectAll: {
				type: Boolean,
				value: false
			},
			removeHeader: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			
			//selectionMode attribute for super-grid
			selectionMode: {
				type: String,
				reflectToAttribute: true
			},

			// 	value: {
			// 		type: "Array",
			// 		value: [],
			// 		observer: '_valueChanged'
			// 	}
			//
			// },
			// _valueChanged: function(newValue, oldValue) {
			// 	if (this.dgrid) {
			//
			// 		//this is due to a bug in dgrid refreshing
			// 		createStore.call(this, []);
			// 		this.dgrid.set('collection', this.store);
			// 		this.dgrid.refresh();
			//
			// 		createStore.call(this, newValue);
			// 		this.dgrid.set('collection', this.store);
			// 		this.dgrid.refresh();
			// 	}
			// }

			_value: {
				type: "Array",
				value: []
				// observer: '_valueChanged'
			}
		},
// <<<<<<< HEAD
		set value(newValue) {
// =======
		// _valueChanged: function(newValue, oldValue) {
// >>>>>>> e3e9622257c7c4a6e6da465faa1243caf3528803
			//if grid is empty to check whether dgrid is undefined or not
			if (!this.dgrid) {
			  this.dgrid={};
			}
			if(this.isTree==true){
				//this is due to a bug in dgrid refreshing
				createStore.call(this, []);
				this.dgrid.set('collection', this.store.getRootCollection());
				this.dgrid.refresh()
				createStore.call(this, newValue);
				this._value = newValue
				this.dgrid.set('collection', this.store.getRootCollection());
				this.dgrid.refresh()
			}


			else{
				createStore.call(this, []);
				this.dgrid.set('collection', this.store);
				this.dgrid.refresh()
				createStore.call(this, newValue);
				this._value = newValue
				this.dgrid.set('collection', this.store);
				this.dgrid.refresh()
			}
		},
		get value () {
			return this._value ? this._value : []
		}
	});

});
