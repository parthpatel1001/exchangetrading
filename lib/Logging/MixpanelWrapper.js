import Mixpanel from 'mixpanel';
import config from 'config';
import {TimeStamp} from '../Utilities/Helpers'

let mixpanel = Mixpanel.init(config.get('Notification.Mixpanel.Token'));

// Uncomment the below to get every call to track to be printed out to console.log
//mixpanel.set_config({ debug: true });

export class MixpanelWrapper {
    static TrackEvent(eventName, eventValueObj, eventDescription, eventSeverity) {
        let eventProps = eventValueObj;
        eventProps.distinct_id = TimeStamp();
        eventProps.eventDescription = eventDescription;
        eventProps.eventSeverity = eventSeverity;

        mixpanel.track(eventName, eventProps);
    }
}
