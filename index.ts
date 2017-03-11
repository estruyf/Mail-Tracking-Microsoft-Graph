import authHelper from './helpers/authHelper'; 
import subscriptionHelper from './helpers/subscriptionHelper'; 
import trackingHelper from './helpers/trackingHelper';

import { IConfig } from './utils/IConfig';
import { IContext } from './utils/IContext';

class Tracker {
    private _config: IConfig;
    private _context: IContext;

    constructor (context: IContext, config: IConfig) {
        this._config = config;
        this._context = context;
    }

    public init(action: string, body: any) {
        const auth = new authHelper(this._config);
        auth.getAppOnlyAccessToken().then((token) => {
            this._context.log('INFO: Access token retrieved');
            // Check if the query contains an action
            if (action) {
                const subscription = new subscriptionHelper(this._config, this._context);
                // New action to complete
                this._context.log(`INFO: Current action > ${action}`);

                switch (action) {
                    // Check if you want to create a new subscription
                    case "create":
                        subscription.create(token).then(() => {
                            this._end({ status: 200, body: "ok" });
                        }).catch(error => {
                            this._end({ status: 200, body: "nok" });
                        });
                        break;
                    // Check if you want to update an existing subscription
                    case "update":
                        subscription.update(token).then(() => {
                            this._end({ status: 200, body: "ok" });
                        }).catch(error => {
                            this._end({ status: 200, body: "nok" });
                        });
                        break;
                    // Check if you want to delete an existing subscription
                    case "delete":
                        subscription.delete(token).then(() => {
                            this._end({ status: 200, body: "ok" });
                        }).catch(error => {
                            this._end({ status: 200, body: "nok" });
                        });
                        break;
                    default:
                        this._end({ status: 200, body: "ok" });
                        break;
                }
            } else {
                if (typeof body !== "undefined") {
                    const track = new trackingHelper(this._config, this._context);
                    const proms = [];
                    body.value.forEach(mail => {
                        proms.push(track.checkMail(mail, token));
                    });
                    Promise.all(proms).then(data => {
                        this._end({ status: 202, body: "ok" });
                    }).catch(error => {
                        this._end({ status: 202, body: "nok" });
                    });
                } else {
                    this._end({ status: 202, body: "ok" });
                }
            }
        })
        .catch(err => {
            this._context.log("ERROR: ", JSON.stringify(err));
            this._end({});
        });
    }

    private _end(res) {
        this._context.done(null, res)
    }
}

module.exports = function (context: IContext, req) {
    const config: IConfig = require('./config.json');
    console.log('ENV:', process.env.NODE_ENV);

    // Check if you are retrieving a validation token
    if (req.query && req.query.validationToken) {
        context.log('INFO: Validation token > ', req.query.validationToken);
        context.done(null, {
            status: 200,
            body: req.query.validationToken
        });
    } else {
        // Check if it contains a querystring or body
        if (req.query || req.body) {
            const action = (req.query.action || req.body.action);
            const body = req.body;
            const tracking = new Tracker(context, config);
            tracking.init(action, body);
        } else {
            context.done(null, { status: 404, body: "nok" });
        }
    }
};
