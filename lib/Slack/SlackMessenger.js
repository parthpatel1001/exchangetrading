import request from 'request';
import config from 'config';

export class SlackMessenger {
    message(body, opt) {
        if(opt && opt.hook_url) {
            let buildBody = (innerOpt) => {
                let channel = innerOpt.channel || config.get('Notification.Slack.default_channel'); //can be direct message as well
                let botname = innerOpt.botname || 'SmartBot';
                let important = innerOpt.important || false;

                return JSON.stringify({
                    username: botname,
                    channel: channel,
                    text: important ? '*' + body + '*' : body,
                    mrkdwn: important
                })
            };

            let hook_url = opt.hook_url;
            request({
                url: hook_url,
                method: 'POST',
                body: buildBody(opt)
            },(err, res, body) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        } else {
            // if we didn't provide an endpoint for slack
            // send the message to the console
            console.log("Body: ",body,"options: ",opt);
        }
    };
}
