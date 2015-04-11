var lame = require('lame');
var icecast = require('icecast');
var Speaker = require('speaker');

// URL to a known Icecast stream
var url = 'http://firewall.pulsradio.com';

// connect to the remote stream
icecast.get(url, function (res) {

  // log the HTTP response headers
  console.error(res.headers);

  // log any "metadata" events that happen
  res.on('metadata', function (metadata) {
    var parsed = icecast.parse(metadata);
    console.error(parsed);
  });

  // Let's play the music (assuming MP3 data).
  // lame decodes and Speaker sends to speakers!
  res.pipe(new lame.Decoder())
     .pipe(new Speaker());
});