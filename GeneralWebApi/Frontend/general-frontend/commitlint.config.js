module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
      "type-enum": [
        2,
        "always",
        [
          "feat", // feature
          "fix", // fix
          "docs", // documentation
          "style", // style
          "refactor", // refactor
          "perf", // performance
          "test", // test
          "chore", // chore build, lint, etc.
          "ci", // continuous integration
          "build", // build
          "revert", // revert to previous state
        ],
      ],
    },
  };