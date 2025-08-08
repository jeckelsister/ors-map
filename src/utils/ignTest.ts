// Test IGN endpoints availability
async function testIgnEndpoint() {
  const testUrl =
    'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=6&TILEROW=22&TILECOL=33';

  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    console.log('IGN endpoint test:', response.status, response.statusText);

    if (response.ok) {
      console.log('✅ IGN endpoint accessible sans clé API');
    } else {
      console.log(
        '❌ IGN endpoint nécessite une clé API ou autre configuration'
      );
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à IGN:', error);
  }
}

// Test with API key
async function testIgnWithKey() {
  const apiKey = 'essentiels'; // Using the key from environment
  const testUrl = `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=6&TILEROW=22&TILECOL=33&apikey=${apiKey}`;

  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    console.log(
      'IGN endpoint avec clé test:',
      response.status,
      response.statusText
    );

    if (response.ok) {
      console.log('✅ IGN endpoint accessible avec clé API');
    } else {
      console.log('❌ Clé API invalide ou endpoint incorrect');
    }
  } catch (error) {
    console.error('❌ Erreur de connexion à IGN avec clé:', error);
  }
}

// Alternative OpenStreetMap France endpoint
async function testOSMFrance() {
  const testUrl = 'https://a.tile.openstreetmap.fr/osmfr/6/33/22.png';

  try {
    const response = await fetch(testUrl, { method: 'HEAD' });
    console.log('OSM France test:', response.status, response.statusText);

    if (response.ok) {
      console.log('✅ OSM France disponible comme alternative');
    }
  } catch (error) {
    console.error('❌ Erreur OSM France:', error);
  }
}

export { testIgnEndpoint, testIgnWithKey, testOSMFrance };
