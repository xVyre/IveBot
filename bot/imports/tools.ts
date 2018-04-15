import { mongoDB } from './types'

export const getArguments = (message: string) => {
  const splitMessage = message.split(' ')
  splitMessage.splice(0, 1)
  return splitMessage.join(' ').trim()
}

export const getIdFromMention = (mention: string) => {
  const f = mention.substring(2, mention.length - 1).split('!').join('').split('&').join('').split(':')
  return f[f.length - 1]
}

export const getServerSettings = async (db: mongoDB, serverID: string) => {
  // Get serverSettings through query.
  const serverSettings = await db.collection('servers').find({ serverID }).toArray()
  if (serverSettings.length === 0) {
    // Initialize server settings.
    await db.collection('servers').insertOne({
      serverID,
      addRoleForAll: false
    })
    const newServerSettings = await db.collection('servers').find({ serverID }).toArray()
    newServerSettings[0].serverId = serverID
    return newServerSettings[0]
  }
  serverSettings[0].serverId = serverID
  return serverSettings[0]
}
