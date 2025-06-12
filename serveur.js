require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');

const express = require('express');
const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

//--------------------------interface admin------------------------------
app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    return res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.send('Mot de passe incorrect. <a href="/admin">Réessayer</a>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin');
  });
});
//--------------------------interface admin------------------------------

const parser = new XMLParser();
const cache = {}; // { channelId: { videoId: 'abc', lastFetched: Date } }
const UPDATE_INTERVAL_MS = 5 * 60 * 1000;

async function fetchLatestVideo(channelId) {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetch(rssUrl);
    const xml = await response.text();
    const json = parser.parse(xml);

    if (!json.feed || !json.feed.entry) {
      throw new Error('Aucune vidéo trouvée dans le flux RSS.');
    }

    const entry = Array.isArray(json.feed.entry) ? json.feed.entry[0] : json.feed.entry;
    const videoId = entry['yt:videoId'];

    cache[channelId] = {
      videoId,
      lastFetched: Date.now()
    };

    return videoId;
  } catch (err) {
    console.error(`❌ Erreur lors du fetch pour ${channelId}:`, err);
    if (cache[channelId]) {
      return cache[channelId].videoId;
    }
    throw err;
  }
}

app.get('/latest-video/:channelId', async (req, res) => {
  const channelId = req.params.channelId;
  const now = Date.now();

  const cached = cache[channelId];
  const isCacheValid = cached && now - cached.lastFetched < UPDATE_INTERVAL_MS;

  if (isCacheValid) {
    return res.json({ videoId: cached.videoId, cached: true });
  }

  try {
    const videoId = await fetchLatestVideo(channelId);
    res.json({ videoId, cached: false });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de la vidéo.' });
  }
});

setInterval(async () => {
  const channelIds = Object.keys(cache);
  for (const channelId of channelIds) {
    try {
      await fetchLatestVideo(channelId);
      console.log(`🔁 Vidéo mise à jour pour ${channelId}`);
    } catch (err) {
      console.warn(`⚠️ Échec de mise à jour pour ${channelId}`);
    }
  }
}, UPDATE_INTERVAL_MS);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${port}`);
});
