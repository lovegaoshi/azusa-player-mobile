import Bilibili from './bilibili/Bilibili';
import YTM from './google/YTM';
import { Site } from '@enums/Network';
import SiteSelector from './SiteSelector';

const LoginPage = ({ loginSite }: { loginSite: Site }) => {
  switch (loginSite) {
    case Site.Bilibili:
      return <Bilibili />;
    case Site.YTM:
      return <YTM />;
  }
};

export default () => <SiteSelector LoginComponent={LoginPage} />;
