import type { AxiosInstance } from 'axios'
import type { Issue, JIRADetails } from './types' // Importing necessary types
import { Buffer } from 'node:buffer'
import { convert } from 'adf-to-md'
import axios from 'axios'
import { getInputs } from './action-inputs'

export class JiraConnector {
  client: AxiosInstance
  JIRA_BASE_URL: string

  constructor() {
    const { JIRA_TOKEN, JIRA_BASE_URL } = getInputs()

    this.JIRA_BASE_URL = JIRA_BASE_URL

    const credentials = `${JIRA_TOKEN}`
    const encodedCredentials = Buffer.from(credentials).toString('base64')

    this.client = axios.create({
      baseURL: `${JIRA_BASE_URL}/rest/api/3`,
      timeout: 10000,
      headers: { Authorization: `Basic ${encodedCredentials}` },
    })
  }

  async getTicketDetails(key: string): Promise<JIRADetails> {
    console.log(`Fetching ${key} details from JIRA`)

    try {
      const issue: Issue = await this.getIssue(key) // Use Issue directly
      const {
        fields: { issuetype: type, project, summary, description, labels },
      } = issue

      let plainTextDescription = ''

      if (description && typeof description === 'object') {
        plainTextDescription = convert(description).result
      }
      else if (typeof description === 'string') {
        plainTextDescription = description
      }

      return {
        key,
        summary,
        url: `${this.JIRA_BASE_URL}/browse/${key}`,
        type: {
          name: type.name,
          icon: type.iconUrl,
        },
        project: {
          name: project.name,
          url: `${this.JIRA_BASE_URL}/browse/${project.key}`,
          key: project.key,
        },
        description: plainTextDescription,
        labels,
      }
    }
    catch (error: any) {
      console.log(
        'Error fetching details from JIRA. Please check if token you provide is built correctly & API key has all needed permissions. https://github.com/cakeinpanic/jira-description-action#jira-token',
      )

      if (error.response) {
        throw new Error(JSON.stringify(error.response.data, null, 4))
      }

      throw error
    }
  }

  async getIssue(id: string): Promise<Issue> { // Use Issue directly
    const url = `/issue/${id}?fields=project,summary,issuetype,description,labels`
    const response = await this.client.get<Issue>(url) // Use Issue directly
    return response.data
  }
}
