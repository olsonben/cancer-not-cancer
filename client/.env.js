const protocols = {
    https: 'https://',
    http: 'http://'
}

const base = 'milmed.ai'

module.exports = {
    url: {
        base: base,
        api: protocols.https + 'api.' + base,
        client: 'api.' + base
    }
}