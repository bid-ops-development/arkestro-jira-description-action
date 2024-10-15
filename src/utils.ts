import {
  BOT_BRANCH_PATTERNS,
  DEFAULT_BRANCH_PATTERNS,
  HIDDEN_MARKER_END,
  HIDDEN_MARKER_START,
  JIRA_REGEX_MATCHER,
  WARNING_MESSAGE_ABOUT_HIDDEN_MARKERS,
} from './constants';
import { JIRADetails } from './types';

const getJIRAIssueKey = (input: string, regexp: RegExp = JIRA_REGEX_MATCHER): string | null => {
  const matches = regexp.exec(input);
  return matches ? matches[matches.length - 1] : null;
};

export const getJIRAIssueKeyByDefaultRegexp = (input: string): string | null => {
  const key = getJIRAIssueKey(input, new RegExp(JIRA_REGEX_MATCHER));
  return key ? key.toUpperCase() : null;
};

export const getJIRAIssueKeysByCustomRegexp = (input: string, numberRegexp: string, projectKey?: string): string | null => {
  const customRegexp = new RegExp(numberRegexp, 'gi');

  const ticketNumber = getJIRAIssueKey(input, customRegexp);
  if (!ticketNumber) {
    return null;
  }
  const key = projectKey ? `${projectKey}-${ticketNumber}` : ticketNumber;
  return key.toUpperCase();
};

export const shouldSkipBranch = (branch: string, additionalIgnorePattern?: string): boolean => {
  if (BOT_BRANCH_PATTERNS.some((pattern) => pattern.test(branch))) {
    console.log('You look like a bot 🤖 so we\'re letting you off the hook!');
    return true;
  }

  if (DEFAULT_BRANCH_PATTERNS.some((pattern) => pattern.test(branch))) {
    console.log(`Ignoring check for default branch ${branch}`);
    return true;
  }

  const ignorePattern = new RegExp(additionalIgnorePattern || '');
  if (!!additionalIgnorePattern && ignorePattern.test(branch)) {
    console.log(`branch '${branch}' ignored as it matches the ignore pattern '${additionalIgnorePattern}' provided in skip-branches`);
    return true;
  }

  return false;
};

const escapeRegexp = (str: string): string => {
  return str.replace(/[\\^$.|?*+(<>)[{]/g, '\\$&');
};

export const getPRDescription = (oldBody: string, details: string): string => {
  const hiddenMarkerStartRg = escapeRegexp(HIDDEN_MARKER_START);
  const hiddenMarkerEndRg = escapeRegexp(HIDDEN_MARKER_END);
  const warningMsgRg = escapeRegexp(WARNING_MESSAGE_ABOUT_HIDDEN_MARKERS);

  const replaceDetailsRg = new RegExp(`${hiddenMarkerStartRg}([\\s\\S]+)${hiddenMarkerEndRg}[\\s]?`, 'igm');
  const replaceWarningMessageRg = new RegExp(`${warningMsgRg}[\\s]?`, 'igm');
  const jiraDetailsMessage = `${WARNING_MESSAGE_ABOUT_HIDDEN_MARKERS}
${HIDDEN_MARKER_START}
${details}
${HIDDEN_MARKER_END}
`;
  if (replaceDetailsRg.test(oldBody)) {
    return (oldBody ?? '').replace(replaceWarningMessageRg, '').replace(replaceDetailsRg, jiraDetailsMessage);
  }
  return jiraDetailsMessage + oldBody;
};

export const buildPRDescription = (details: JIRADetails) => {
  const displayKey = details.key.toUpperCase();
  const listAsString = details.labels.join(' ');
  return `<table><tbody><tr><td><a href="${details.url}" title="${displayKey}" target="_blank"><img alt="${details.type.name}" src="${details.type.icon}" /> ${displayKey}</a>
  ${details.summary}</td><td>${details.type.name}</td></tr></tbody></table><br />
  **Labels:** ${listAsString}

  ${details.description}`;
};
