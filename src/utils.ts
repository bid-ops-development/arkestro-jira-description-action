import type { JIRADetails } from './types'
import {
  BOT_BRANCH_PATTERNS,
  DEFAULT_BRANCH_PATTERNS,
  HIDDEN_MARKER_END,
  HIDDEN_MARKER_START,
  JIRA_REGEX_MATCHER,
  WARNING_MESSAGE_ABOUT_HIDDEN_MARKERS,
} from './constants'

function getJIRAIssueKey(input: string, regexp: RegExp = JIRA_REGEX_MATCHER): string | null | undefined {
  const matches = regexp.exec(input)
  return matches ? matches[matches.length - 1] : null
}

export function getJIRAIssueKeyByDefaultRegexp(input: string): string | null {
  const key = getJIRAIssueKey(input, new RegExp(JIRA_REGEX_MATCHER))
  return key ? key.toUpperCase() : null
}

export function getJIRAIssueKeysByCustomRegexp(input: string, numberRegexp: string, projectKey?: string): string | null {
  const customRegexp = new RegExp(numberRegexp, 'gi')

  const ticketNumber = getJIRAIssueKey(input, customRegexp)
  if (!ticketNumber) {
    return null
  }
  const key = projectKey ? `${projectKey}-${ticketNumber}` : ticketNumber
  return key.toUpperCase()
}

export function shouldSkipBranch(branch: string, additionalIgnorePattern?: string): boolean {
  if (BOT_BRANCH_PATTERNS.some(pattern => pattern.test(branch))) {
    console.log('You look like a bot 🤖 so we\'re letting you off the hook!')
    return true
  }

  if (DEFAULT_BRANCH_PATTERNS.some(pattern => pattern.test(branch))) {
    console.log(`Ignoring check for default branch ${branch}`)
    return true
  }

  const ignorePattern = new RegExp(additionalIgnorePattern || '')
  if (!!additionalIgnorePattern && ignorePattern.test(branch)) {
    console.log(`branch '${branch}' ignored as it matches the ignore pattern '${additionalIgnorePattern}' provided in skip-branches`)
    return true
  }

  return false
}

function escapeRegexp(str: string): string {
  return str.replace(/[\\^$.|?*+(<>)[{]/g, '\\$&')
}

export function getPRDescription(oldBody: string, details: string): string {
  const hiddenMarkerStartRg = escapeRegexp(HIDDEN_MARKER_START)
  const hiddenMarkerEndRg = escapeRegexp(HIDDEN_MARKER_END)
  const warningMsgRg = escapeRegexp(WARNING_MESSAGE_ABOUT_HIDDEN_MARKERS)

  const replaceDetailsRg = new RegExp(`${hiddenMarkerStartRg}([\\s\\S]+)${hiddenMarkerEndRg}[\\s]?`, 'gim')
  const replaceWarningMessageRg = new RegExp(`${warningMsgRg}[\\s]?`, 'gim')
  const jiraDetailsMessage = `${WARNING_MESSAGE_ABOUT_HIDDEN_MARKERS}
${HIDDEN_MARKER_START}
${details}
${HIDDEN_MARKER_END}
`
  if (replaceDetailsRg.test(oldBody)) {
    return (oldBody ?? '').replace(replaceWarningMessageRg, '').replace(replaceDetailsRg, jiraDetailsMessage)
  }
  return jiraDetailsMessage + oldBody
}

function buildPRDescription(details: JIRADetails): string {
  const labelString = details.labels.join(', ') // Join labels with a comma and space

  return `<table>
    <thead style="font-family:'Courier New', monospace; font-weight: bold; background-color: 0d8dba;">
      <tr>
        <th>Ticket Description</th>
        <th>Ticket Type</th>
        <th>Labels</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><a href="${details.url}" title="${details.key}" target="_blank"><img alt="${details.type.icon}" src="${details.type.icon}" /> ${details.key}</a> ${details.summary}</td>
        <td>${details.type.name}</td>
        <td>${labelString}</td>
      </tr>
    </tbody>
  </table><br />
  
  ${details.description}`
}
