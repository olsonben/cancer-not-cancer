/**
 * These are globally accessible values
 * Accessible with:
 * import * as env from '/.env'
 */

const protocols = {
    https: 'https://',
    http: 'http://'
}

const base = 'milmed.ai'
const client_subDomain = 'api.'

module.exports = {
    url: {
        base: base,
        api: protocols.https + 'api.' + base,
        client: protocols.https + client_subDomain + base
    }
}