const SuperError = require("../classes/SuperError");

module.exports = async(self, ...arguments) => {
    let reactions = [];
    for (let i = 4; i < arguments.length; i++) reactions.push(arguments[i]);
    let message = {
        "messageID": arguments[0],
        "channelID": arguments[1],
        "limit": arguments[2],
        "restrictions": arguments[3],
        "reactions": reactions,
        "guildID": null
    }
    if (self.client.user) {
        let msg = await self.client.channels.cache.get(message.channelID).messages.fetch(message.messageID).catch(err => {
            throw new SuperError("CanNotFetchMesssage", err.toString());
        });
        if (!msg) throw new SuperError("CanNotFetchMesssage", err.toString());
        message.guildID = msg.guild.id;
        for (let { emoji } of reactions) {
            emoji = require("./cleanEmoji")(emoji);
            let messageReaction = msg.reactions.cache.get(emoji);
            if (!messageReaction) await msg.react(emoji).catch((err) => {
                throw new SuperError("CanNotReactMesssage", err.toString());
            });
            else {
                if (!messageReaction.me) {
                    messageReaction.users.fetch();
                    await msg.react(emoji).catch((err) => {
                        throw new SuperError("CanNotReactMesssage", err.toString());
                    });
                };
            };
        };
        if (self.mongoURL) self.database.createMessage(message);
    }
    self.config.push(message);
};