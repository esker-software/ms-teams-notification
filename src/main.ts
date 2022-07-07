import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import axios from 'axios'
import moment from 'moment-timezone'
import {createMessageCard} from './message-card'

const escapeMarkdownTokens = (text: string) =>
  text
    .replace(/\n\ {1,}/g, '\n ')
    .replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\|/g, '\\|')
    .replace(/#/g, '\\#')
    .replace(/-/g, '\\-')
    .replace(/>/g, '\\>')

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token', {required: true})
    const msTeamsWebhookUri: string = core.getInput('ms-teams-webhook-uri', {
      required: true
    })

    const notificationTitle =
      core.getInput('notification-title') || 'GitHub Action Notification'
    const notificationText =
      core.getInput('notification-text') || 'My incredible message !'
    const notificationColor = core.getInput('notification-color') || '0b93ff'
    const printCommit = core.getInput('print-commit') == 'true' || true // Cast to boolean
    const timezone = core.getInput('timezone') || 'UTC'

    const timestamp = moment()
      .tz(timezone)
      .format('dddd, MMMM Do YYYY, h:mm:ss a z')

    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
    const sha = process.env.GITHUB_SHA || ''
    const runId = process.env.GITHUB_RUN_ID || ''
    const runNum = process.env.GITHUB_RUN_NUMBER || ''
    const params = {owner, repo, ref: sha}
    const repoName = params.owner + '/' + params.repo
    const baseUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
    const apiBaseUrl = process.env.GITHUB_API_URL || ''
    const repoUrl = `${baseUrl}/${repoName}`

    const octokit = new Octokit({
      auth: `token ${githubToken}`,
      baseUrl: apiBaseUrl
    })
    const commit = await octokit.repos.getCommit(params)
    const author = commit.data.author

    const messageCard = await createMessageCard(
      notificationTitle,
      notificationText,
      notificationColor,
      printCommit,
      commit,
      author,
      runNum,
      runId,
      repoName,
      sha,
      repoUrl,
      timestamp
    )

    console.log(messageCard)

    axios
      .post(msTeamsWebhookUri, messageCard)
      .then(function(response: {data: string}) {
        console.log(response)
        core.debug(response.data)
      })
      .catch(function(error: string) {
        core.debug(error)
      })
  } catch (error) {
    console.log(error)
    core.setFailed((error as Error).message)
  }
}

run()
