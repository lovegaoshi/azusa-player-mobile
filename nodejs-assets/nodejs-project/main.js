// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.
import rn_bridge from '../nodejs-builtin_modules/rn-bridge/index.js';
import { getPot } from './getpot.js';

// Echo every message received from react-native.
rn_bridge.channel.on('potoken', async msg => {
  const poTokenResult = await getPot(msg);

  rn_bridge.channel.post(
    'potoken',
    JSON.stringify({ poToken: poTokenResult.poToken, identifier: msg }),
  );
});

// Inform react-native node is initialized.
rn_bridge.channel.send('Node was initialized.');
