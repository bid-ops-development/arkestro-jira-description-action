import { GitHubActionTypeScriptProject } from 'projen-github-action-typescript';
const project = new GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  devDeps: ['projen-github-action-typescript'],
  name: 'arkestro-jira-description-action',
  projenrcTs: true,

  deps: [
    '@atlaskit/adf-utils',
    'axios',
    '@octokit/plugin-rest-endpoint-methods',
  ], /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();

// const project = new GitHubActionTypeScriptProject({
//   name: 'my-project',
//   defaultReleaseBranch: 'main',
//   actionMetadata: {
//     runs: {
//       using: RunsUsing.NODE_12,
//       main: 'dist/index.js',
//     },
//     inputs: {
//       myInput: {
//         description: 'my first input',
//       },
//     },
//     outputs: {
//       myOutput: {
//         description: 'my first output',
//       },
//     },
//   },
// });
