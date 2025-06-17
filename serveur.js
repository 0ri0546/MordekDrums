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

app.use(express.static(path.join(__dirname, 'admin')));

//---apreçu images dispo--
const fs = require('fs');

app.get('/list-images', (req, res) => {
  const assetsPath = path.join(__dirname, 'public', 'assets');
  fs.readdir(assetsPath, (err, files) => {
    if (err) {
      console.error('Erreur de lecture des fichiers :', err);
      return res.status(500).json({ error: 'Erreur lecture des images' });
    }

    // Filtrer uniquement les images
    const imageFiles = files.filter(file => /\.(png|jpe?g|webp|gif|svg)$/i.test(file));
    res.json(imageFiles);
  });
});
//---apreçu images dispo--
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


//--------------------Modification .json-----------------------
app.get('/admin/json/:section', (req, res) => {
  if (!req.session.loggedIn) return res.status(401).send('Non autorisé');

  const section = req.params.section;
  const filePath = path.join(__dirname, 'public', 'content', section, `${section}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier non trouvé');
  }

  const content = fs.readFileSync(filePath, 'utf8');
  res.type('application/json').send(content);
});

const { DateTime } = require('luxon');

app.post('/admin/json/:section', express.json(), (req, res) => {
  if (!req.session.loggedIn) return res.status(401).send('Non autorisé');

  const section = req.params.section;
  const filePath = path.join(__dirname, 'public', 'content', section, `${section}.json`);

  const now = DateTime.now().setZone('Europe/Paris');
  const formattedDate = now.toFormat("dd/MM/yyyy 'à' HH:mm:ss");

  try {
    const jsonData = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(filePath, jsonData);
    res.send('Fichier mis à jour à ' + formattedDate);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur d\'écriture du fichier');
  }
});

//-----import image---------
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'assets'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send('Non autorisé');
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.send(`✅ Image uploadée avec succès : <a href="${imageUrl}">${imageUrl}</a>`);
});

app.delete('/delete-image/:filename', (req, res) => {
  if (!req.session.loggedIn) return res.status(403).send('Non autorisé');

  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'assets', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Erreur suppression image :', err);
      return res.status(500).send('Erreur suppression image');
    }
    res.send('Image supprimée');
  });
});

app.post('/rename-image', express.json(), (req, res) => {
  if (!req.session.loggedIn) return res.status(403).send('Non autorisé');

  const { oldName, newName } = req.body;
  const dir = path.join(__dirname, 'public', 'assets');

  const oldPath = path.join(dir, oldName);
  const newPath = path.join(dir, newName);

  if (!fs.existsSync(oldPath)) {
    return res.status(404).send('Image introuvable.');
  }

  if (fs.existsSync(newPath)) {
    return res.status(400).send('Ce nom existe déjà.');
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error('Erreur renommage :', err);
      return res.status(500).send('Erreur serveur.');
    }

    res.send('Image renommée.');
  });
});
//-----import image---------