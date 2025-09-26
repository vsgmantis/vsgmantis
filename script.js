// Spotify App Credentials (public for now)
const clientId = '3930e6707edd4e1cafe210abb9246300';
const clientSecret = '9927e7baef004a878cfa4ace93cc6dc6';
const trackURI = 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp';

let deviceId = null;

// Fix: define this right away, not inside a button click
window.onSpotifyWebPlaybackSDKReady = () => {
  console.log('Spotify SDK is ready');

  getAccessToken().then(token => {
    const player = new Spotify.Player({
      name: 'VSG Player',
      getOAuthToken: cb => cb(token),
      volume: 0.6
    });

    player.addListener('ready', ({ device_id }) => {
      deviceId = device_id;
      console.log('Player Ready. Device ID:', device_id);

      // Play as soon as device is ready
      playTrack(token, device_id);
    });

    player.addListener('initialization_error', e => console.error('Init error:', e));
    player.addListener('authentication_error', e => console.error('Auth error:', e));
    player.addListener('account_error', e => console.error('Account error:', e));
    player.addListener('playback_error', e => console.error('Playback error:', e));

    player.connect();
  });
};

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  return data.access_token;
}

async function playTrack(token, deviceId) {
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [trackURI]
    })
  });
}
