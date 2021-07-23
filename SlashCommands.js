/**
 * A Discord.js slash command manager. Capable of creating, editing, and deleting commands,
 * as well as setting up permissions.
 */
class SlashCommandInterface
{
    /**
     * Create a SlashCommandInterface object.
     * @param {Client} client The Discord.js client object.
     */
    constructor(client)
    {
        if (client == null || typeof client !== 'object')
            throw new Error("Please pass a Discord client object to the constructor.")

        this.client = client;
    }

    /**
     * Create a new slash command.
     * @param {{}} commandData The command data of the command to create, including name, arguments, and description.
     * @param {string} guildID The ID of the guild to create the command in. Leave this blank to create the command globaly.
     * @param {[]} permissions The permissions to use for the command. 
     * @returns {Promise<SlashCommand>} A promise that resolves to the created command.
     */
    postCommand(commandData, guildID = null, permissions = null)
    {
        return new Promise((resolve, reject) =>
        {
            if (commandData == null || typeof commandData !== 'object')
            {
                reject('Please pass an object containing command data to postCommand.')
                return
            }
            else if (guildID != null && typeof guildID !== 'string')
            {
                reject('If passing a guild id, please pass as a string.')
                return
            }

            var doPostCommand

            if (guildID == null)
                doPostCommand = (() => this.client.api.applications(this.client.user.id).commands.post({data: commandData}))
            else
                doPostCommand = (() => this.client.api.applications(this.client.user.id).guilds(guildID).commands.post({data: commandData}))

            doPostCommand().then((response) =>
            {
                if (permissions != null)
                    this.editCommandPermissions({id: response.id}, permissions, guildID).then((response) => resolve(response)).catch((error) => reject(error))
                else
                    resolve(response)
            }).catch((error) => reject(error))
        })
    }

    /**
     * Removes a slash command.
     * @param {{}} commandInfo The information of the command to remove, including ID (perfered) or name.
     * @param {string} guildID The ID of the guild to remove the command from. Leave this blank to remove the command globaly.
     * @returns {Promise<SlashCommand>} A promise that resolves to the response.
     */
    deleteCommand(commandInfo, guildID = null)
    {
        return new Promise((resolve, reject) =>
        {
            if (commandInfo == null || !('id' in commandInfo || 'name' in commandInfo))
                reject("No command specified. Give either a command id (perfered) via commandInfo.id or name via commandInfo.name.")
            else
            {
                if (!('id' in commandInfo))
                {
                    this.getCommand(commandInfo, guildID).then((command) =>
                    {
                        if (command)
                            this.deleteCommand({id: command.id}, guildID).then((response) => resolve(response)).catch(error => reject(error))
                        else
                            reject('No command found with name ' + commandInfo.name + '!')

                    }).catch((error) => reject(error))
                }
                else
                {
                    if (guildID == null)
                        this.client.api.applications(this.client.user.id).commands(commandInfo.id).delete().then((response) => resolve(response)).catch(error => reject(error))
                    else
                        this.client.api.applications(this.client.user.id).guilds(guildID).commands(commandInfo.id).delete().then((response) => resolve(response)).catch(error => reject(error))
                }
            }
        })
    }

    /**
     * Edits the permissions of a slash command.
     * @param {{}} commandInfo The information of the command to edit, including ID (perfered) or name.
     * @param {[]} newPermissions The permissions to update for the command.
     * @param {string} guildID The ID of the guild to edit the permissions of the command in. Leave this blank to edit the permissions globaly.
     * @returns {Promise<SlashCommand>} A promise that resolves to the edited command.
     */
    editCommandPermissions(commandInfo, newPermissions, guildID = null)
    {
        return new Promise((resolve, reject) =>
        {
            if (commandInfo == null || !('id' in commandInfo || 'name' in commandInfo))
                reject("No command specified. Give either a command id (perfered) via commandInfo.id or name via commandInfo.name.")
            else
            {
                if (!('id' in commandInfo))
                {
                    if (!('name' in commandInfo))
                        reject("No command specified. Give either a command id (perfered) via commandInfo.id or name via commandInfo.name.")

                    this.getCommand(commandInfo, guildID).then((command) =>
                    {
                        if (command)
                            this.editCommandPermissions({id: command.id}, newPermissions, guildID).then((response) => resolve(response)).catch(error => reject(error))
                        else
                            reject('No command found with name ' + commandInfo.name + '!')

                    }).catch(error => reject(error))
                }
                else
                {
                    if (guildID == null)
                        this.client.api.applications(this.client.user.id).commands(commandInfo.id).permissions.put({data: {permissions: newPermissions}}).then((response) => resolve(response)).catch(error => reject(error))
                    else
                        this.client.api.applications(this.client.user.id).guilds(guildID).commands(commandInfo.id).permissions.put({data: {permissions: newPermissions}}).then((response) => resolve(response)).catch(error => reject(error))
                }
            }
        })
    }

    /**
     * Gets a command.
     * @param {{}} commandInfo The information of the command to get, including ID (perfered) or name.
     * @param {string} guildID The ID of the guild to get the command from. Leave this blank to get the command globaly.
     * @returns {Promise<SlashCommand>} A promise that resolves to the command.
     */
    getCommand(commandInfo, guildID = null)
    {
        return new Promise((resolve, reject) =>
        {
            if (commandInfo == null || !('id' in commandInfo || 'name' in commandInfo))
                reject("No command specified. Give either a command id (perfered) via commandInfo.id or name via commandInfo.name.")
            else
                this.getCommands(guildID).then((commands) => resolve((commands.find(command => command.name === commandInfo.name || command.id === commandInfo.id)))).catch((error) => reject(error))
        })
    }

    /**
     * Gets all commands.
     * @param {string} guildID The ID of the guild to get the commands from. Leave this blank to get all global commands.
     * @returns {Promise<SlashCommand[]>} A promise that resolves to an array of all commands.
     */
    getCommands(guildID = null)
    {
        return new Promise((resolve, reject) =>
        {
            var doGetCommands

            if (guildID === null)
                doGetCommands = (() => this.client.api.applications(this.client.user.id).commands.get())
            else
                doGetCommands = (() => this.client.api.applications(this.client.user.id).guilds(guildID).commands.get())
            
            doGetCommands().then((commands) => resolve(commands)).catch((error) => reject(error))
        })
    }
}

module.exports = SlashCommandInterface