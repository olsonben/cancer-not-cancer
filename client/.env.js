/**
 * These are globally accessible values
 * Accessible with:
 * import * as env from '/.env.js'
 * 
 * From .env
 * PORT
 * DOMAIN
 * SUB_DOMAIN
 * 
 */

const protocols = {
    https: 'https://',
    http: 'http://'
}

module.exports = {
    url: {
        base: process.env.DOMAIN,
        api: protocols.https + process.env.SUB_DOMAIN_API + process.env.DOMAIN,
        client: protocols.https + process.env.SUB_DOMAIN_CLIENT + process.env.DOMAIN
    }
}