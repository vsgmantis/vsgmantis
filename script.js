// Spotify App Credentials (exposed for now — swap to secure later)
const clientId = '3930e6707edd4e1cafe210abb9246300';
const clientSecret = '9927e7baef004a878cfa4ace93cc6dc6';

// Track URI to auto-play (you can change this)
const trackURI = 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp';

let deviceId = null;

document.getElementById('playButton').addEventListener('click', async () => {
  const token = await getAccessToken();
  await setupPlayer(token);
});

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

async function setupPlayer(token) {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
      name: 'VSG Player',
      getOAuthToken: cb => cb(token),
      volume: 0.6
    });

    player.addListener('ready', ({ device_id }) => {
      deviceId = device_id;
      console.log('Spotify Player Ready:', deviceId);
      playTrack(token, deviceId);
    });

    player.addListener('initialization_error', e => console.error('Init error:', e));
    player.addListener('authentication_error', e => console.error('Auth error:', e));
    player.addListener('account_error', e => console.error('Account error:', e));
    player.addListener('playback_error', e => console.error('Playback error:', e));

    player.connect();
  };
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
