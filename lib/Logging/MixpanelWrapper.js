import Mixpanel from 'mixpanel';
import config from 'config';
var extend = require('util')._extend;

let mixpanel = Mixpanel.init(config.get('Notification.Mixpanel.Token'));

// Uncomment the below to get every call to track to be printed out to console.log
//mixpanel.set_config({ debug: true });

export class MixpanelWrapper {
    static TrackEvent(eventName, eventValueObj, eventDescription, eventSeverity) {
        let eventProps = {
            distinct_id: Date.now(),
            eventDescription: eventDescription,
            eventSeverity: eventSeverity
        };

        extend(eventProps, eventValueObj);

        mixpanel.track(eventName, eventProps);
    }
}
