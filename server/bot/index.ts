// We need types.
import { DB } from './imports/types'
import { Member, Message, Client, User, Guild } from 'eris'
import { Db } from 'mongodb'

// Database reading function.
import { getServerSettings } from './imports/tools'

// When a server gains a member, this function will be called.
export const guildMemberAdd = (client: Client, db: Db) => async (
  guild: Guild, member: Member
) => {
  // Get server settings.
  const serverSettings = await getServerSettings(db, guild.id)
  // If there's autorole enabled..
  if (serverSettings.joinAutorole) {
    // For each role..
    serverSettings.joinAutorole.split('|').forEach((role: string) => {
      const roleName = role.startsWith('bot-') ? role.substr(4) : role
      const roleID = member.guild.roles.find(element => element.name === roleName).id
      if (!roleID) return
      if (roleName.startsWith('bot-') && member.user.bot) member.addRole(roleID)
      else if (!roleName.startsWith('bot-') && !member.user.bot) member.addRole(roleID)
    })
  }
  // If join/leave messages is not configured/improperly configured..
  if (!serverSettings.joinLeaveMessages) return
  const { joinMessage, channelName } = serverSettings.joinLeaveMessages
  if (!channelName || !joinMessage) return
  // We send a message.
  const channelID = guild.channels.find(i => i.name === channelName).id
  const toSend = joinMessage
    .split('{un}').join(member.user.username) // Replace the username.
    .split('{m}').join(member.user.mention) // Replace the mention.
    .split('{d}').join(member.user.discriminator) // Replace the discriminator.
  try { client.createMessage(channelID, toSend) } catch (e) { }
}

// When a server loses a member, this function will be called.
export const guildMemberRemove = (client: Client, db: Db) => async (
  guild: Guild, member: Member|{ id: string, user: User }
) => {
  // Get server settings.
  const serverSettings = await getServerSettings(db, guild.id)
  // If join/leave messages is not configured/improperly configured..
  if (!serverSettings.joinLeaveMessages) return
  const { leaveMessage, channelName } = serverSettings.joinLeaveMessages
  if (!channelName || !leaveMessage) return
  // We send a message.
  const channelID = guild.channels.find(i => i.name === channelName).id
  const toSend = leaveMessage
    .split('{un}').join(member.user.username) // Replace the username.
    .split('{m}').join(member.user.mention) // Replace the mention.
    .split('{d}').join(member.user.discriminator) // Replace the discriminator.
  try { client.createMessage(channelID, toSend) } catch (e) {}
}

// When client recieves a message, it will callback.
export default async (message: Message, client: Client, tempDB: DB, db: Db) => {
  try {
    if ( // If there are no permissions do not do anything.
      !message.member.guild.channels.find(i => i.id === message.channel.id)
        .permissionsOf(client.user.id).has('sendMessages')
    ) return
  } catch (e) {}
  // Content of message and sendResponse.
  const sendResponse = (m: string) => client.createMessage(message.channel.id, m)
  const command = message.content.toLowerCase()
  // Auto responses and easter eggs.
  if (command.startsWith('is dot a good boy')) sendResponse('Shame on you. He\'s undefined.')
  else if (command.startsWith('iphone x')) sendResponse(`You don't deserve it. 😎`)
  else if (command.startsWith('triggered')) sendResponse('Ah, pathetic people again.')
  else if (command.startsWith('ayy')) sendResponse('lmao')
  // Handle answers to gunfight.
  // else if (command in ['fire', 'water', 'gun', 'dot']) return
}
