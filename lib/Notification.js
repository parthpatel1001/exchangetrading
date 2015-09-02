import {SlackMessenger} from './Logging/SlackMessenger';

let slackMessenger = new SlackMessenger();

export class Notification {
	message(body, opt) {
		slackMessenger.message(body, opt);
	}
}
