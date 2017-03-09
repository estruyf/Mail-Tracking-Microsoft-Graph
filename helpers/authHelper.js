"use strict";
var adal = require('adal-node');
var AuthenticationContext = adal.AuthenticationContext;
var authHelper = (function () {
    function authHelper(config) {
        this.config = config;
    }
    authHelper.prototype.getAppOnlyAccessToken = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var context = new AuthenticationContext(_this.config.adalConfig.authority);
            context.acquireTokenWithClientCredentials(_this.config.adalConfig.graphUrl, _this.config.adalConfig.clientID, _this.config.adalConfig.clientSecret, function (err, tokenResponse) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(tokenResponse.accessToken);
                }
            });
        });
    };
    return authHelper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authHelper;

//# sourceMappingURL=../maps/helpers/authHelper.js.map
