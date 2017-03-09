import * as request from "superagent";

const adal = require('adal-node');
const AuthenticationContext = adal.AuthenticationContext;

import { IConfig } from '../utils/IConfig';

export default class authHelper {
    constructor(public config: IConfig) { }

    /**
     * Gets an app-only access token
     */
    public getAppOnlyAccessToken(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var context = new AuthenticationContext(this.config.adalConfig.authority);
            context.acquireTokenWithClientCredentials(this.config.adalConfig.graphUrl, this.config.adalConfig.clientID, this.config.adalConfig.clientSecret, (err, tokenResponse) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tokenResponse.accessToken);
                }
            });
        });
    }
}