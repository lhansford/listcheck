module.exports = {
	"presets": [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    "@babel/typescript"
	],
	"plugins": [
			"@babel/proposal-object-rest-spread",
			"@babel/plugin-transform-async-to-generator"
  ],
}
