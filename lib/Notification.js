import {SlackMessenger} from './Logging/SlackMessenger';
import {MixpanelWrapper} from './Logging/MixpanelWrapper'

let slackMessenger = new SlackMessenger();

export let NotificationLevels = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH"
};

export class Notification {
    static eventTriggered(eventName, eventValue, eventDescription, eventSeverity) {
        MixpanelWrapper.TrackEvent(eventName, eventValue, eventDescription, eventSeverity);
    }

	message(body, opt) {
		slackMessenger.message(body, opt);
	}
}
