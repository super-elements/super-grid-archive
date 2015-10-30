var profile = {
	action: "release",
	cssOptimize: false,
	locale: 'en-us',
	mini: false,
	//optimize : "shrinksafe",

	stripConsole: "all",
	selectorEngine: "lite",
	packages: ["dojo", "dgrid", "xstyle", "put-selector", "lib", "dstore"],
	layers: {
		"dojo/out": {
			include: [
				"dojo/dojo",
				"dojo/has",
				'dojo/_base/declare',
				'dgrid/List',
				'dgrid/Keyboard',
				'dgrid/Grid',
				'dgrid/Tree',
				'dgrid/Selection',
				'dgrid/Selector',
				'dgrid/OnDemandGrid',
				'dstore/Tree',
				'dstore/Trackable',
				'dstore/Memory',
				'lib/Editor'
			],
			customBase: true,
			boot: false,
			includeLocales: ['en-us', 'en-gb']
		}
	},
	plugins: {
		"xstyle/css": "xstyle/build/amd-css"
	},
	staticHasFeatures: {
		// The trace & log APIs are used for debugging the loader, so we don't need them in the build
		"dojo-trace-api": 0,
		"dojo-has-api": 0,
		"ie": 10,

		"dojo-host-node": 0,

		"dojo-log-api": 0,

		// This causes normally private loader data to be exposed for debugging, so we don't need that either
		"dojo-publish-privates": 0,

		// We're fully async, so get rid of the legacy loader
		"dojo-sync-loader": 0,

		// We aren't loading tests in production
		"dojo-test-sniff": 0
	}
}
