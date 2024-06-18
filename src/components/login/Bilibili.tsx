import * as React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import CookieManager from '@react-native-cookies/cookies';

import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import GenericInputDialog from '../dialogs/GenericInputDialog';
import BiliSelectFavButtton from './BiliSelectFavButtton';
import useBiliLogin, { BiliLogin } from './useBiliLoginApp';
import useSnack from '@stores/useSnack';

const domain = 'https://bilibili.com';

interface LoginPageProps {
  biliLogin: BiliLogin;
}

interface LogginginPageProps extends LoginPageProps {
  setInputCookieVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const LoggedInPage = ({ biliLogin }: LoginPageProps) => {
  const { t } = useTranslation();
  const { loginInfo, setLoginInfo } = biliLogin;

  const logout = () => {
    setLoginInfo(null);
    CookieManager.clearAll();
  };

  if (!loginInfo) return <></>;

  return (
    <View style={styles.loggedInContainerStyle}>
      <View style={styles.avatarContainerStyle}>
        <Avatar.Image source={{ uri: loginInfo.avatar }}></Avatar.Image>
        <View style={styles.avatarUsernameStyle}>
          <Text variant="headlineSmall">{loginInfo.name}</Text>
          <Button onPress={logout}>{t('Login.Logout')}</Button>
        </View>
      </View>
      <BiliSelectFavButtton />
      <Text>{t('Login.Disclaimer')}</Text>
    </View>
  );
};

const LoginPage = ({
  biliLogin,
  setInputCookieVisible,
}: LogginginPageProps) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const { qrcode, setQrCode, setQrCodeKey, setQrCodeExpire, getQRLoginReq } =
    biliLogin;

  const generateBiliQRCode = async () => {
    const processFunction = async () => {
      const qrCodeReq = await getQRLoginReq();
      setQrCode(qrCodeReq.url);
      setQrCodeKey(qrCodeReq.key);
      setQrCodeExpire(qrCodeReq.expire);
    };

    setSnack({
      snackMsg: {
        processing: t('Login.BilibiliLoginQRGeneration'),
        success: t('Login.BilibiliLoginQRGenerated'),
        fail: t('Login.BilibiliLoginQRGenerateFailed'),
      },
      processFunction,
    });
  };

  return (
    <View style={styles.textContainerStyle}>
      <Text style={styles.notLoginTextStyle}>
        {t('Login.BilibiliNotLoggedIn')}
      </Text>
      <Button mode="contained-tonal" onPress={generateBiliQRCode}>
        {t('Login.BilibiliLoginButton')}
      </Button>
      <View style={styles.inputButtonContainerStyle} />
      <Button
        mode="contained-tonal"
        onPress={() => setInputCookieVisible(true)}
      >
        {t('Login.BilibiliCookieInputButton')}
      </Button>
      <Text>{t('Login.Disclaimer')}</Text>
      {qrcode !== '' && (
        <View style={styles.qrCodeContainerStyle}>
          <QRCode value={qrcode} size={300} />
        </View>
      )}
    </View>
  );
};

export default () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const appRefresh = useNoxSetting(state => state.appRefresh);
  const setSnack = useSnack(state => state.setSnack);
  const [inputCookieVisible, setInputCookieVisible] = React.useState(false);
  const biliLogin = useBiliLogin();
  const {
    loginInfo,
    initialize,
    clearQRLogin,
    getBiliLoginStatus,
    loginQRVerification,
  } = biliLogin;

  const manualInputCookies = async (input: { [key: string]: string }) => {
    try {
      if (input.SESSDATA.length > 0 && input.bili_jct.length > 0) {
        await CookieManager.set(domain, {
          name: 'SESSDATA',
          value: input.SESSDATA,
        });
        await CookieManager.set(domain, {
          name: 'bili_jct',
          value: input.bili_jct,
        });
        logger.debug('[setCookie] manually input cookie;');
        clearQRLogin();
        getBiliLoginStatus();
        // https://github.com/biliup/biliup-rs/issues/75
        // doesnt work:(
        // confirmWebQRCode(input.SESSDATA, input.bili_jct);
      } else if (
        input.access_token.length > 0 &&
        input.refresh_token.length > 0
      ) {
        await CookieManager.set(domain, {
          name: 'access_key',
          value: input.access_token,
        });
        await CookieManager.set(domain, {
          name: 'refresh_token',
          value: input.refresh_token,
        });
        loginQRVerification().then(() => getBiliLoginStatus());
      }
    } catch (e) {
      logger.error(`[setCookie] ${e}`);
    } finally {
      setInputCookieVisible(false);
    }
  };

  React.useEffect(() => {
    if (appRefresh) return;
    loginQRVerification();
  }, []);

  return (
    <SafeAreaView
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      {initialize ? (
        <ActivityIndicator size={100} />
      ) : loginInfo ? (
        <LoggedInPage biliLogin={biliLogin} />
      ) : (
        <LoginPage
          biliLogin={biliLogin}
          setInputCookieVisible={setInputCookieVisible}
        />
      )}
      <GenericInputDialog
        options={['SESSDATA', 'bili_jct', 'access_token', 'refresh_token']}
        visible={inputCookieVisible}
        title={t('Login.BilibiliCookieInputDialogTitle')}
        onClose={() => setInputCookieVisible(false)}
        onSubmit={manualInputCookies}
      ></GenericInputDialog>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  notLoginTextStyle: {
    paddingVertical: 20,
    textAlign: 'center',
  },
  textContainerStyle: {
    alignContent: 'center',
    alignItems: 'center',
  },
  inputButtonContainerStyle: {
    paddingVertical: 10,
  },
  qrCodeContainerStyle: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  loggedInContainerStyle: {
    paddingHorizontal: 5,
  },
  avatarContainerStyle: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingVertical: 10,
  },
  avatarUsernameStyle: {
    paddingLeft: 10,
  },
});
