import * as request from "superagent";
import * as moment from "moment";

import { IConfig } from '../utils/IConfig';
import { IContext } from '../utils/IContext';
import { ITrackers } from '../utils/ITrackers';
import { IMessage } from '../utils/IMessage';

const knownTrackers: ITrackers = require('../trackers.json');
export default class Tracking {
    constructor (public config: IConfig, public context: IContext) {}

    public checkMail(mail, token: string) {
        this.context.log("INFO: Checking mail with SubscriptionId > ", mail.subscriptionId);

        return new Promise((resolve, reject) => {
            let resource = mail.resource;
            let reqUrl = `https://graph.microsoft.com/v1.0/${resource}`;
            request
                .get(reqUrl)
                .set({
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                })
                .end((error, response) => {
                    if (error || !response.ok) {
                        this.context.log('ERROR: There was an error checking the mail.');
                        this.context.log(JSON.stringify(response.body));
                        resolve(error);
                        return;
                    }

                    this.context.log("INFO: Retrieved mail content");
                    const result: IMessage = response.body;
                    if (result) {
                        // Check for a tracker
                        let bodyHtml = result.body.content;
                        let tracking = false;
                        let trackingNames = [];
                        if (typeof result.categories !== 'undefined') {
                            trackingNames = result.categories;
                            // Nothing to do, because it already contains the tracking category
                            if (trackingNames.indexOf("Tracked") !== -1) {
                                resolve(null);
                                return;
                            }
                        }
                        // Put tracking first
                        trackingNames.unshift("Tracked");
                        // Check if one of the trackers is used
                        knownTrackers.trackers.forEach((tracker) => {
                            // Check if the email body contains the tracking URL part
                            if (bodyHtml.indexOf(tracker.url) !== -1) {
                                tracking = true;
                                trackingNames.push(tracker.name);
                            }
                        });

                        // Check if mail was tracked
                        if (tracking) {
                            this.context.log("INFO: Mail is tracked, adding tracking categories");
                            request
                                .patch(reqUrl)
                                .set({
                                    "Content-Type": "application/json",
                                    "Accept": "application/json",
                                    "Authorization": "Bearer " + token
                                })
                                .send(JSON.stringify({
                                    categories: trackingNames
                                }))
                                .end((error, response) => {
                                    if (error || !response.ok) {
                                        this.context.log('ERROR: There was a problem patching the mail.');
                                        this.context.log(JSON.stringify(response.body));
                                        resolve(error);
                                    } else {
                                        resolve(null);
                                    }
                                });
                        } else {
                            console.log(`INFO: Nothing to do for this mail: ${mail.subscriptionId}`);
                            resolve(null);
                        }
                    } else {
                        this.context.log(`ERROR: With retrieving the mail.`);
                        resolve(null);
                    }
                });
        });
    }
}