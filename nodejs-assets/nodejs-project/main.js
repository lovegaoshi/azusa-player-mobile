// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.

const rn_bridge = require('rn-bridge');
const BG = require('bgutils');
const JSDOM = require('jsdom').JSDOM;
const Innertube = require('youtubei.js').Innertube;

let innertube = await Innertube.create({ retrieve_player: false });

const requestKey = 'O43z0dpjhgX20SCx4KAo';
const visitorData = innertube.session.context.client.visitorData;

// Echo every message received from react-native.
rn_bridge.channel.on('potoken', async msg => {
  const dom = new JSDOM();
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });
  const bgConfig = {
    globalObj: globalThis,
    identifier: msg ?? visitorData,
    requestKey,
  };
  const bgChallenge = await BG.Challenge.create(bgConfig);
  if (!bgChallenge) throw new Error('Could not get challenge');

  const interpreterJavascript =
    bgChallenge.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (interpreterJavascript) {
    new Function(interpreterJavascript)();
  } else throw new Error('Could not load VM');
  const poTokenResult = await BG.PoToken.generate({
    program: bgChallenge.program,
    globalName: bgChallenge.globalName,
    bgConfig,
  });

  // const placeholderPoToken = BG.PoToken.generatePlaceholder(visitorData);

  rn_bridge.channel.post('potoken', poTokenResult.poToken);
});

// Inform react-native node is initialized.
rn_bridge.channel.send('Node was initialized.');
