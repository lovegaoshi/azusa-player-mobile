export default () => {
  /**
    const [skin, setSkin] = useState(DEFAULT_SETTING.skin);
    const [settingObj, setSettingObj] = useState({});
    const [parseSongName, setParseSongName] = useState(DEFAULT_SETTING.parseSongName);
    const [autoRSSUpdate, setAutoRSSUpdate] = useState(DEFAULT_SETTING.autoRSSUpdate);
    const [settingExportLocation, setSettingExportLocation] = useState(DEFAULT_SETTING.settingExportLocation);
    const [keepSearchedSongListWhenPlaying, setKeepSearchedSongListWhenPlaying] = useState(DEFAULT_SETTING.keepSearchedSongListWhenPlaying);
    const [personalCloudIP, setPersonalCloudIP] = useState('');
    const [hideCoverInMobile, setHideCoverInMobile] = useState(DEFAULT_SETTING.hideCoverInMobile);
    const [tabValue, setTabValue] = React.useState('1');
    const [loadPlaylistAsArtist, setLoadPlaylistAsArtist] = useState(DEFAULT_SETTING.loadPlaylistAsArtist);
    const [sendBiliHeartbeat, setSendBiliHeartbeat] = useState(DEFAULT_SETTING.sendBiliHeartbeat);
    const [noCookieBiliSearch, setNoCookieBiliSearch] = useState(DEFAULT_SETTING.noCookieBiliSearch);

    const setSettings = (setFunc: (val) => void, value: any = undefined, defaultValue: any = undefined) => {
        if (value !== undefined) {
          setFunc(value);
        } else if (defaultValue !== undefined) {
          setFunc(defaultValue);
        }
      };
    
      async function init() {
        settings = await settings;
        setSettingObj(settings);
        const skinIndex = SkinKeys.indexOf(settings.skin);
        if (skinIndex !== -1) {
          setSkin(settings.skin);
        } else {
          setSkin(SkinKeys[0]!);
        }
        setSettings(setParseSongName, settings.parseSongName);
        setSettings(setAutoRSSUpdate, settings.autoRSSUpdate);
        setSettings(setSettingExportLocation, settings.settingExportLocation);
        setSettings(setKeepSearchedSongListWhenPlaying, settings.keepSearchedSongListWhenPlaying);
        setSettings(setPersonalCloudIP, settings.personalCloudIP, '');
        setSettings(setHideCoverInMobile, settings.hideCoverInMobile);
        setSettings(setLoadPlaylistAsArtist, settings.loadPlaylistAsArtist);
        setSettings(setSendBiliHeartbeat, settings.sendBiliHeartbeat);
        setSettings(setNoCookieBiliSearch, settings.noCookieBiliSearch);
      }
      // load settings into this dialog
      useEffect(() => {
        init();
      }, []);

      const handleOK = () => {
        const updatedSettingObj = {
          ...settingObj,
          skin,
          parseSongName,
          autoRSSUpdate,
          settingExportLocation,
          keepSearchedSongListWhenPlaying,
          personalCloudIP,
          hideCoverInMobile,
          loadPlaylistAsArtist,
          sendBiliHeartbeat,
          noCookieBiliSearch,
        };
        onClose(updatedSettingObj);
      };
    return null;
 */
};
