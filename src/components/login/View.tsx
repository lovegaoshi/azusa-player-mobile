import Bilibili from './bilibili/Bilibili';
import YTM from './google/YTM';
import { Site, LoginSites } from '@enums/Network';
import SiteSelector from './SiteSelector';
import { useYTMLogin } from './google/useYTMLogin';
import useBiliLogin from './bilibili/useBiliLoginApp';
import { useAPM } from '@stores/usePersistStore';
import { useNoxSetting } from '@stores/useApp';

const LoginPage = ({ loginSite }: { loginSite: Site }) => {
  const ytmLogin = useYTMLogin();
  const biliLogin = useBiliLogin();

  console.log(loginSite);
  switch (loginSite) {
    case Site.Bilibili:
      return <Bilibili biliLogin={biliLogin} />;
    case Site.YTM:
      return <YTM ytmLogin={ytmLogin} />;
    default:
      return <Bilibili biliLogin={biliLogin} />;
  }
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { loginPage, setLoginPage } = useAPM();

  return (
    <SiteSelector
      containerStyle={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
      LoginComponent={LoginPage}
      defaultSite={loginPage}
      onSiteChange={setLoginPage}
      sites={LoginSites}
    />
  );
};
