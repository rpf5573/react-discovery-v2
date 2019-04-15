module.exports = {
  compact: true,
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        targets: {
          browsers: ["since 2015"]
        },
        useBuiltIns: "usage",
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties"
  ]
}