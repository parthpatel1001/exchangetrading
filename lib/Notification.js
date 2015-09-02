import {SlackMessenger} from './Logging/SlackMessenger';
import {MixpanelWrapper} from './Logging/MixpanelWrapper'

let slackMessenger = new SlackMessenger();

export class Notification {
    eventTriggered(eventName, eventValue, eventDescription, eventSeverity) {
        MixpanelWrapper.trackEvent(eventName, eventValue, eventDescription, eventSeverity);
    }


	message(body, opt) {
		slackMessenger.message(body, opt);
	}
}
