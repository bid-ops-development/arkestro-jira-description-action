import axios, { AxiosInstance } from 'axios';
import { getInputs } from './action-inputs';
import { JIRA, JIRADetails } from './types';
import { traverse } from '@atlaskit/adf-utils';

function extractTextFromADF(adfNode: any): string {
  let text = '';

  // Define a visitor with handlers for different node types.
  const visitor = {
    text: (node: any) => {
      text += node.text + ' ';
    },
    paragraph: () => {
      text += '\n';
    },
    bulletList: () => {
      text += '\n'; // Add a newline before a bullet list for readability.
    },
    orderedList: () => {
      text += '\n'; // Add a newline before an ordered list for readability.
    },
    listItem: () => {
      text += '* '; // Prefix list items with '* ' for simplicity.
    },
    heading: (node: any) => {
      text += '\n' + '#'.repeat(node.attrs.level) + ' '; // Use '#' to represent heading levels.
    },
    // Add additional handlers for other node types as necessary here.
    // You may want to handle `hardBreak`, `blockquote`, `codeBlock`, etc.
  };

  traverse(adfNode, visitor);

  return text; //text.trim(); // Trim the final string to remove any extra whitespace.
}

// function extractTextFromADF(adfNode: any): string {
//   let text = '';

//   function traverseNode(node: any) {
//     console.log('Traversing node: ', JSON.stringify(node, null, 2));

//     if (node.type === 'text' && node.text) {
//       text += "\n" + node.text;
//       console.log('Text found: ', node.text);
//     } else if (node.type === 'paragraph' && node.content && Array.isArray(node.content)) {
//       node.content.forEach(traverseNode);
//       text += '\n';
//     } else if (node.type === 'hardBreak') {
//       text += '\n';
//     } else if (node.content && Array.isArray(node.content)) {
//       node.content.forEach(traverseNode);
//     }
//   }

//   traverseNode(adfNode);

//   console.log('Final extracted text: ', text);
//   return text;
// }
export class JiraConnector {
  client: AxiosInstance;
  JIRA_BASE_URL: string;

  constructor() {
    const { JIRA_TOKEN, JIRA_BASE_URL } = getInputs();

    this.JIRA_BASE_URL = JIRA_BASE_URL;

    const credentials = `${JIRA_TOKEN}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    this.client = axios.create({
      baseURL: `${JIRA_BASE_URL}/rest/api/3`,
      timeout: 10000,
      headers: { Authorization: `Basic ${encodedCredentials}` },
    });
  }

  async getTicketDetails(key: string): Promise<JIRADetails> {
    console.log(`Fetching ${key} details from JIRA`);

    try {
      const issue: JIRA.Issue = await this.getIssue(key);
      const {
        fields: { issuetype: type, project, summary, description },
      } = issue;

      let plainTextDescription = '';

      if (description && typeof description === 'object') {
        plainTextDescription = extractTextFromADF(description);
      } else if (typeof description === 'string') {
        plainTextDescription = description;
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
      };
    } catch (error) {
      console.log(
        'Error fetching details from JIRA. Please check if token you provide is built correctly & API key has all needed permissions. https://github.com/cakeinpanic/jira-description-action#jira-token'
      );

      if (error.response) {
        throw new Error(JSON.stringify(error.response.data, null, 4));
      }

      throw error;
    }
  }

  async getIssue(id: string): Promise<JIRA.Issue> {
    const url = `/issue/${id}?fields=project,summary,issuetype,description`;
    const response = await this.client.get<JIRA.Issue>(url);
    return response.data;
  }
}

// {"expand":"renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations,customfield_10151.cmdb.label,customfield_10151.cmdb.objectKey,customfield_10151.cmdb.attributes,customfield_10010.requestTypePractice","id":"24181","self":"https://arkestrodev.atlassian.net/rest/api/3/issue/24181","key":"INFRAENG-329","fields":{"statuscategorychangedate":"2024-09-12T19:21:33.329+0000","fixVersions":[],"customfield_10110":null,"customfield_10111":null,"resolution":null,"customfield_10112":null,"customfield_10113":null,"customfield_10114":null,"customfield_10104":null,"customfield_10105":null,"customfield_10106":null,"customfield_10107":null,"customfield_10108":null,"customfield_10109":null,"lastViewed":null,"customfield_10180":null,"customfield_10060":null,"customfield_10181":null,"customfield_10062":null,"customfield_10184":null,"priority":{"self":"https://arkestrodev.atlassian.net/rest/api/3/priority/10000","iconUrl":"https://arkestrodev.atlassian.net/images/icons/priorities/low.svg","name":"p3 - Low","id":"10000"},"customfield_10100":null,"customfield_10101":null,"customfield_10102":null,"labels":[],"aggregatetimeoriginalestimate":null,"timeestimate":null,"versions":[],"issuelinks":[],"assignee":{"self":"https://arkestrodev.atlassian.net/rest/api/3/user?accountId=712020%3A2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","accountId":"712020:2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","emailAddress":"frank.schlenter@arkestro.com","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","24x24":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","16x16":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","32x32":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png"},"displayName":"frank.schlenter","active":true,"timeZone":"Etc/GMT","accountType":"atlassian"},"status":{"self":"https://arkestrodev.atlassian.net/rest/api/3/status/10010","description":"","iconUrl":"https://arkestrodev.atlassian.net/","name":"In Progress","id":"10010","statusCategory":{"self":"https://arkestrodev.atlassian.net/rest/api/3/statuscategory/4","id":4,"key":"indeterminate","colorName":"yellow","name":"In Progress"}},"components":[],"customfield_10050":null,"customfield_10172":null,"customfield_10051":null,"customfield_10173":null,"customfield_10052":null,"customfield_10174":null,"customfield_10053":null,"customfield_10054":null,"customfield_10175":null,"customfield_10176":null,"customfield_10055":null,"customfield_10056":null,"customfield_10177":null,"customfield_10178":null,"customfield_10057":null,"customfield_10058":[],"customfield_10059":null,"aggregatetimeestimate":null,"creator":{"self":"https://arkestrodev.atlassian.net/rest/api/3/user?accountId=712020%3A2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","accountId":"712020:2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","emailAddress":"frank.schlenter@arkestro.com","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","24x24":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","16x16":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","32x32":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png"},"displayName":"frank.schlenter","active":true,"timeZone":"Etc/GMT","accountType":"atlassian"},"subtasks":[],"customfield_10160":null,"customfield_10040":null,"customfield_10161":null,"customfield_10162":null,"customfield_10163":null,"customfield_10164":null,"reporter":{"self":"https://arkestrodev.atlassian.net/rest/api/3/user?accountId=712020%3A2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","accountId":"712020:2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","emailAddress":"frank.schlenter@arkestro.com","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","24x24":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","16x16":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","32x32":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png"},"displayName":"frank.schlenter","active":true,"timeZone":"Etc/GMT","accountType":"atlassian"},"aggregateprogress":{"progress":0,"total":0},"customfield_10044":1.0,"customfield_10165":null,"customfield_10166":null,"customfield_10167":null,"customfield_10038":null,"customfield_10159":null,"customfield_10039":null,"progress":{"progress":0,"total":0},"votes":{"self":"https://arkestrodev.atlassian.net/rest/api/3/issue/INFRAENG-329/votes","votes":0,"hasVoted":false},"worklog":{"startAt":0,"maxResults":20,"total":0,"worklogs":[]},"issuetype":{"self":"https://arkestrodev.atlassian.net/rest/api/3/issuetype/10015","id":"10015","description":"Tasks track small, distinct pieces of work.","iconUrl":"https://arkestrodev.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium","name":"Task","subtask":false,"avatarId":10318,"entityId":"a6e75bef-f9af-4a5c-b465-daa8fbcf4e57","hierarchyLevel":0},"timespent":null,"customfield_10150":null,"customfield_10151":[],"customfield_10030":null,"project":{"self":"https://arkestrodev.atlassian.net/rest/api/3/project/10003","id":"10003","key":"INFRAENG","name":"Infrastructure Engineering","projectTypeKey":"software","simplified":true,"avatarUrls":{"48x48":"https://arkestrodev.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10416","24x24":"https://arkestrodev.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10416?size=small","16x16":"https://arkestrodev.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10416?size=xsmall","32x32":"https://arkestrodev.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10416?size=medium"}},"customfield_10031":null,"customfield_10032":null,"customfield_10153":null,"customfield_10154":null,"customfield_10155":null,"aggregatetimespent":null,"customfield_10156":null,"customfield_10036":null,"customfield_10157":null,"customfield_10158":null,"customfield_10037":[],"customfield_10027":null,"customfield_10028":null,"customfield_10029":null,"resolutiondate":null,"workratio":-1,"watches":{"self":"https://arkestrodev.atlassian.net/rest/api/3/issue/INFRAENG-329/watchers","watchCount":1,"isWatching":false},"issuerestriction":{"issuerestrictions":{},"shouldDisplay":true},"created":"2024-09-12T19:21:32.992+0000","customfield_10020":null,"customfield_10021":null,"customfield_10022":null,"customfield_10023":null,"customfield_10024":null,"customfield_10025":null,"customfield_10016":null,"customfield_10017":null,"customfield_10018":{"hasEpicLinkFieldDependency":false,"showField":false,"nonEditableReason":{"reason":"PLUGIN_LICENSE_ERROR","message":"The Parent Link is only available to Jira Premium users."}},"customfield_10019":"0|r02167:","updated":"2024-09-17T21:34:59.830+0000","timeoriginalestimate":null,"description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"need to delete old ones too."}]}]},"customfield_10010":null,"customfield_10014":null,"timetracking":{},"customfield_10015":null,"customfield_10005":null,"customfield_10006":null,"customfield_10007":null,"security":null,"customfield_10008":null,"attachment":[],"customfield_10009":null,"summary":"create terraform version of database monitors and put them in the terraform-aws-rds-common modules","customfield_10000":"{}","customfield_10001":null,"customfield_10002":[],"customfield_10003":null,"customfield_10004":null,"customfield_10115":null,"customfield_10116":null,"customfield_10117":null,"environment":null,"customfield_10119":null,"duedate":null,"comment":{"comments":[{"self":"https://arkestrodev.atlassian.net/rest/api/3/issue/24181/comment/31202","id":"31202","author":{"self":"https://arkestrodev.atlassian.net/rest/api/3/user?accountId=712020%3A2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","accountId":"712020:2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","emailAddress":"frank.schlenter@arkestro.com","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","24x24":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","16x16":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","32x32":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png"},"displayName":"frank.schlenter","active":true,"timeZone":"Etc/GMT","accountType":"atlassian"},"body":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"got these into the module, but need to deal with dr / read replicas"}]}]},"updateAuthor":{"self":"https://arkestrodev.atlassian.net/rest/api/3/user?accountId=712020%3A2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","accountId":"712020:2f8d00c0-e17d-48a7-bfef-a4701cf92e1b","emailAddress":"frank.schlenter@arkestro.com","avatarUrls":{"48x48":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","24x24":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","16x16":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png","32x32":"https://secure.gravatar.com/avatar/81763e479ef3433a074d417d2fb3d8f0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FF-2.png"},"displayName":"frank.schlenter","active":true,"timeZone":"Etc/GMT","accountType":"atlassian"},"created":"2024-09-16T17:12:46.663+0000","updated":"2024-09-16T17:12:46.663+0000","jsdPublic":true}],"self":"https://arkestrodev.atlassian.net/rest/api/3/issue/24181/comment","maxResults":1,"total":1,"startAt":0}}}%
