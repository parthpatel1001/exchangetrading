import Mixpanel from 'mixpanel';
import config from 'config';

let mixpanel = Mixpanel.init(config.get('Notification.Mixpanel.Token'));

// Uncomment the below to get every call to track to be printed out to console.log
//mixpanel.set_config({ debug: true });

export class MixpanelWrapper {
    static TrackEvent(eventName, eventValue, eventDescription, eventSeverity) {
        mixpanel.track(eventName, {
            distinct_id: Date.now(),
            eventValue: eventValue,
            eventDescription: eventDescription,
            eventSeverity: eventSeverity
        });
    }
}


