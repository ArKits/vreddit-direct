const axios = require('axios');
const xmlToJson = require('./xml');
const allowCors = require('./cors');

const VREDDIT_PATH = 'https://v.redd.it/';
const DASH_PLAYLIST_PATH = '/DASHPlaylist.mpd';

async function postDirect(req, res) {
    try {
        console.time('postDirect');
        let id = req.query.id;
        if (!id) {
            throw new Error('invalid request - no id');
        }
        id = id.trim();
        console.log(`postDirect request for id=${id}`);

        let dashPlaylistUrl = VREDDIT_PATH + id + DASH_PLAYLIST_PATH;

        let response = await axios.get(dashPlaylistUrl);

        let parsedDashPlaylist = xmlToJson(response.data);

        let adaptationSet = parsedDashPlaylist.MPD.Period.AdaptationSet;
        console.log(JSON.stringify(adaptationSet, null, 2));

        // Determine Audio Channel URL
        let audioChannelUrl = getAudioChannelUrl(adaptationSet, id);

        // Determine Video Channel URLs
        let videoChannelUrls = getVideoChannelUrls(adaptationSet, id);

        console.timeEnd('postDirect');
        res.json({
            message: 'OK',
            videoId: id,
            audioChannelUrl: audioChannelUrl,
            videoChannelUrls: videoChannelUrls
        });
    } catch (error) {
        console.error('Caught Error - ', error.message, error);
        res.status(400);
        res.json({
            error: error.message
        });
    }
}

function getAudioChannelUrl(adaptationSet, id) {
    let audioChannelBaseUrl = null;

    if (Array.isArray(adaptationSet)) {
        for (let representation of adaptationSet) {
            if ('AudioChannelConfiguration' in representation.Representation) {
                audioChannelBaseUrl = representation.Representation.BaseURL;
                break;
            }
        }

        if (audioChannelBaseUrl !== null) {
            return VREDDIT_PATH + id + '/' + audioChannelBaseUrl;
        }
    }

    return null;
}

function getVideoChannelUrls(adaptationSet, id) {
    let videoChannelUrls = [];

    let videoChannelRepresentations = null;

    if (Array.isArray(adaptationSet)) {
        for (let representation of adaptationSet) {
            if (Array.isArray(representation.Representation)) {
                videoChannelRepresentations = representation.Representation;
            }
        }
    } else {
        videoChannelRepresentations = adaptationSet.Representation;
    }

    if (videoChannelRepresentations) {
        for (let vcr of videoChannelRepresentations) {
            videoChannelUrls.push(VREDDIT_PATH + id + '/' + vcr.BaseURL);
        }
    }

    return videoChannelUrls;
}

module.exports = allowCors(postDirect);
