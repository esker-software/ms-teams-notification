export function createMessageCard(
  notificationTitle: string,
  notificationText: string,
  notificationColor: string,
  printCommit: boolean,
  commit: any,
  author: any,
  runNum: string,
  runId: string,
  repoName: string,
  sha: string,
  repoUrl: string,
  timestamp: string
): any {
  let avatar_url =
    'https://www.gravatar.com/avatar/05b6d8cc7c662bf81e01b39254f88a48?d=identicon'
  if (author) {
    if (author.avatar_url) {
      avatar_url = author.avatar_url
    }
  }
  let messageCard = {}
  if (printCommit) {
    const messageCard = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      text: notificationText,
      themeColor: notificationColor,
      title: notificationTitle,
      sections: [
        {
          activityTitle: `**CI #${runNum} (commit ${sha.substr(
            0,
            7
          )})** on [${repoName}](${repoUrl})`,
          activityImage: avatar_url,
          activitySubtitle: `by ${commit.data.commit.author.name} [(@${author.login})](${author.html_url}) on ${timestamp}`
        }
      ],
      potentialAction: [
        {
          '@context': 'http://schema.org',
          target: [`${repoUrl}/actions/runs/${runId}`],
          '@type': 'ViewAction',
          name: 'View Workflow Run'
        },
        {
          '@context': 'http://schema.org',
          target: [commit.data.html_url],
          '@type': 'ViewAction',
          name: 'View Commit Changes'
        }
      ]
    }
  } else {
    const messageCard = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      text: notificationText,
      themeColor: notificationColor,
      title: notificationTitle,
      potentialAction: [
        {
          '@context': 'http://schema.org',
          target: [`${repoUrl}/actions/runs/${runId}`],
          '@type': 'ViewAction',
          name: 'View Workflow Run'
        }
      ]
    }
  }

  return messageCard
}
