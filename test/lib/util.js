function normalizeURL(url, pathPrefix, accessToken) {

    url = url.replace(/^mapbox:\/\//, 'https://a.tiles.mapbox.com/v4/');
    url += url.indexOf('?') !== -1 ? '&access_token=' : '?access_token=';
    url += accessToken;

    return url;
}

module.exports.normalizeStyleURL = function(url, accessToken) {
    var user = url.match(/^mapbox:\/\/([^.]+)/);
    if (!user)
        return url;

    return normalizeURL(url, '/styles/v1/' + user[1] + '/', accessToken);
};

module.exports.normalizeSourceURL = function(url, accessToken) {
    if (!url.match(/^mapbox:\/\//))
        return url;

    url = normalizeURL(url + '.json', '/v4/', accessToken);

    // TileJSON requests need a secure flag appended to their URLs so
    // that the server knows to send SSL-ified resource references.
    if (url.indexOf('https') === 0)
        url += '&secure';

    return url;
};

module.exports.normalizeGlyphsURL = function(url, accessToken) {
    if (!url.match(/^mapbox:\/\//))
        return url;

    return normalizeURL(url, '/v4/', accessToken);
};

module.exports.normalizeTileURL = function(url, sourceUrl) {
    if (!sourceUrl || !sourceUrl.match(/^mapbox:\/\//))
        return url;
    return url.replace(/\.((?:png|jpg)\d*)(?=$|\?)/, 1 >= 2 ? '@2x.$1' : '.$1');
};
