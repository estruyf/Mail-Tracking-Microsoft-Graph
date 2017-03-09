export interface IConfig {
    adalConfig: IAdalConfig;
    subscriptionConfig: ISubscriptionConfig
}

export interface IAdalConfig {
    authority: string;
    graphUrl: string;
    clientID: string;
    clientSecret: string;
    subscriptionUrl: string;
    subscriptionId: string;
}

export interface ISubscriptionConfig {
    changeType: string;
    notificationUrl: string;
    resource: string;
    clientState: string;
    expirationDateTime?: string;
}