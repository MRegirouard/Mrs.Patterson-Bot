/**
 * A Discord.js slash command manager. Capable of creating, editing, and deleting commands,
 * as well as setting up permissions and command listeners.
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
         this._commandHandlers = []
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
 
     /**
      * Adds one or more commands to the listeners. Uses the same callback for all commands specified.
      * @param {string[]} names The name(s) of the command(s) to listen for.
      * @param {Function} callback The callback to call when the command is used.
      */
     listenForCommand(names, callback)
     {
         if (names == null || names === '' || (typeof names !== 'string' && typeof names !== 'object'))
             throw new Error('No command name specified or name is not a string!')
         else if (callback == null || typeof callback !== 'function')
             throw new Error('No callback specified or callback is not a function!')
 
         if (this._commandHandlers.length === 0)
         {
             this.client.ws.on('INTERACTION_CREATE', (interaction) =>
             {
                 const correctHandler = this._commandHandlers.find(handler => handler.name === interaction.data.name)
 
                 if (correctHandler)
                     correctHandler.callback(interaction)
             })
         }
 
         if (typeof names === 'string')
             this._commandHandlers.push({name: names, callback: callback})
         else
         {
             for (const newName of names)
                 this._commandHandlers.push({name: newName, callback: callback})
         }
     }
 
     /**
      * Removes a command from the command listeners.
      * @param {string} name The name of the command to remove.
      * @returns {{}} The command handler object that was removed.
      */
     stopListeningForCommand(name)
     {
         if (name == null || name === '' || typeof name !== 'string')
             throw new Error('No command name specified or name is not a string!')
 
         const handlerToRemove = this._commandHandlers.find(handler => handler.name === name)
 
         if (handlerToRemove)
             this._commandHandlers.splice(this._commandHandlers.indexOf(handlerToRemove), 1)
 
         return handlerToRemove
     }
 
     /**
      * Responds to an interaction with a message.
      * @param {{}}} interaction The interaction to respond to.
      * @param {string} message The message to send.
      * @returns {Promise<{}>} A promise that resolves to the response.
      */
     respondToInteraction(interaction, message = '')
     {
         if (interaction == null || typeof interaction !== 'object')
             throw new Error('No interaction specified or interaction is not an object!')
         else if (message == null || typeof message !== 'string')
             throw new Error('No message specified or message is not a string!')
 
         return this.client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data: {content: message}}})
     }
 }
 
 module.exports = SlashCommandInterface