import * as log from 'bog';
import config from '../config';

interface WbcParsed {
    id: string;
    name: string;
    avatar: string;
    memberType: string;
}

class Wbc {
    wbc: any;

    register(wbc: any) {
        this.wbc = wbc;
    }

    async fetchSlackUsers() {
        const users: WbcParsed[] = [];
        const bots: WbcParsed[] = [];

        log.info('Fetching slack users via wbc');
        const result = await this.wbc.users.list();

        const botIds = result.filter((x: any) => {
          x.name === 'heyburrito'
        });
        if (botIds.length() === 0 && config.slack.bot_id.length() > 0) {
          log.info('Hey no bots in result')
          const ourBot = await this.wbc.users.info(config.slack.bot_id)
          result.push(ourBot)
        }

        result.members.forEach((x: any) => {
            // reassign correct array to arr
            const arr = x.is_bot ? bots : users;
            arr.push({
                id: x.id,
                name: x.is_bot ? x.name : x.real_name,
                memberType: x.is_restricted ? 'guest' : 'member',
                avatar: x.profile.image_48,
            });
        });
        return { users, bots };
    }

    async sendDM(username: string, text: string) {
        const res = await this.wbc.chat.postMessage({
            text,
            channel: username,
            username: config.slack.bot_name,
            icon_emoji: ':burrito:',
        });
        if (res.ok) {
            log.info(`Notified user ${username}`);
        }
    }
}

export default new Wbc();
