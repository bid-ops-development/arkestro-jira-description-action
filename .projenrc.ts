import { NodePackageManager } from 'projen/lib/javascript';
import { GitHubActionTypeScriptProject, RunsUsing } from 'projen-github-action-typescript';

const project = new GitHubActionTypeScriptProject({
  authorName: 'Arkestro',
  authorEmail: 'frank.schlenter@arkestro.com',
  description: 'This action adds the JIRA issue key to the PR description',
  defaultReleaseBranch: 'main',
  name: 'arkestro-jira-description-action',
  eslintOptions: {
    dirs: ['src'],
    tsconfigPath: './tsconfig.dev.json',
    fileExtensions: ['.ts', '.tsx', '.yml'],
  },
  mergify: false,
  packageManager: NodePackageManager.YARN_BERRY,
  projenrcTs: true,
  devDeps: ['projen-github-action-typescript'],
  deps: [
    '@atlaskit/adf-utils',
    '@octokit/core',
    '@octokit/plugin-rest-endpoint-methods',
    'adf-to-md',
    'axios',
  ],
  actionMetadata: {
    name: 'arkestro-jira-description-action',
    description: 'Add JIRA issue details to your GitHub pull request.',
    inputs: {
      'github-token': {
        description: 'Token used to update PR description and add labels. Can be passed in using {{ secrets.GITHUB_TOKEN }}',
        required: true,
      },
      'jira-token': {
        description: 'API Token used to access the JIRA REST API. Must have read access to your JIRA Projects & Issues. Format: <jira username>:<jira token>',
        required: true,
      },
      'jira-base-url': {
        description: 'The subdomain of JIRA cloud that you use to access it. Ex: "https://your-domain.atlassian.net"',
        required: true,
      },
      'use': {
        description: 'Where to look for issue key: branch | pr-title | both',
        required: false,
      },
      'skip-branches': {
        description: 'A regex to ignore running on certain branches, like production etc.',
        required: false,
        default: '',
      },
      'jira-project-key': {
        description: 'Key of project in jira. First part of issue key',
        required: false,
        default: '',
      },
      'custom-issue-number-regexp': {
        description: 'Custom regexp to extract issue number from branch name.',
        required: false,
        default: '',
      },
      'fail-when-jira-issue-not-found': {
        description: 'Mark the PR status check as failed when a jira issue is not found',
        required: false,
        default: 'false',
      },
    },
    outputs: {
      'jira-issue-key': {
        description: 'The JIRA issue key. If key is not found, the value is an empty string',
      },
      'jira-issue-found': {
        description: 'Indication whether a jira issue was found or not',
      },
      'jira-issue-source': {
        description: 'Indication how the jira issue was found, by - branch | pr-title | null',
      },
    },
    runs: {
      using: RunsUsing.NODE_20,
      main: 'dist/index.js',
    },
    branding: {
      icon: 'terminal',
      color: 'blue',
    },
  },
});

project.synth();

