import * as request from "superagent";
import * as moment from "moment";

import { IConfig } from '../utils/IConfig';
import { IContext } from '../utils/IContext';

export default class subscriptionHelper {
    private subConfig = this.config.subscriptionConfig;

    constructor (public config: IConfig, public context: IContext) {}

    public create(token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.context.log("INFO: Creating a new subscription");
            this.subConfig.expirationDateTime = this.getExpirationDate();

            // Create the new subscription
            request
                .post(this.config.adalConfig.subscriptionUrl)
                .set({
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                })
                .send(JSON.stringify(this.subConfig))
                .end((error, response) => {
                    if (error || !response.ok) {
                        this.context.log('ERROR: There was an error creating the subscription.');
                        this.context.log(JSON.stringify(response.body));
                        reject(error);
                        return;
                    }

                    const result = response.body;
                    if (result) {
                        if (typeof result.id !== "undefined") {
                            this.context.log(`INFO: Subscription created with the following ID > ${result.id}`);
                        } else {
                            this.context.log(`ERROR: Problem creating the subscription > ${JSON.stringify(result)}`);
                        }
                        resolve(null);
                    } else {
                        this.context.log(`ERROR: Problem creating the subscription. Body was not defined.`);
                        resolve(null);
                    }
                });
		});
    }


    public update(token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.context.log("INFO: Updating the existing subscription");

            request
                .patch(`${this.config.adalConfig.subscriptionUrl}/${this.config.adalConfig.subscriptionId}`)
                .set({
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                })
                .send(JSON.stringify({
                    "expirationDateTime": this.getExpirationDate()
                }))
                .end((error, response) => {
                    if (error || !response.ok) {
                        this.context.log('ERROR: There was an error updating the subscription.');
                        this.context.log(JSON.stringify(response.body));
                        reject(error);
                        return;
                    }

                    const result = response.body;
                    if (result) {
                        if (typeof result.id !== "undefined") {
                            this.context.log(`INFO: Subscription updated > ${this.config.adalConfig.subscriptionId}`);
                        } else {
                            this.context.log(`ERROR: Problem updating the subscription > ${JSON.stringify(result)}`);
                        }
                        resolve(null);
                    } else {
                        this.context.log(`ERROR: Problem updating the subscription. Body was not defined.`);
                        resolve(null);
                    }
                });
        });
    }

    public delete(token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.context.log("INFO: Updating the existing subscription");

            request
                .del(`${this.config.adalConfig.subscriptionUrl}/${this.config.adalConfig.subscriptionId}`)
                .set({
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                })
                .end((error, response) => {
                    if (error || !response.ok) {
                        this.context.log('ERROR: There was an error deleting the subscription.');
                        this.context.log(JSON.stringify(response.body));
                        reject(error);
                        return;
                    }

                    const result = response.body;
                    if (result) {
                        this.context.log(`INFO: Subscription deleted`);
                        resolve(null);
                    } else {
                        this.context.log(`ERROR: Problem deleting the subscription. Body was not defined.`);
                        resolve(null);
                    }
                });
        });
    }

    private getExpirationDate() {
        // Request this subscription to expire one day from now.
        // Note: 1 day = 86400000 milliseconds
        // The name of the property coming from the service might change from
        // subscriptionExpirationDateTime to expirationDateTime in the near future.
        return new Date(Date.now() + (86400000 * 2.9)).toISOString();
    }
}