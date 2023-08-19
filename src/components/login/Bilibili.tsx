import * as React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import Snackbar from 'react-native-snackbar';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ParamListBase } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';

import { useNoxSetting } from '@hooks/useSetting';
import { logger } from '@utils/Logger';
import GenericInputDialog from '../dialogs/GenericInputDialog';
import BiliSelectFavButtton from './BiliSelectFavButtton';
import useBiliLogin from './useBiliLoginApp';

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

const domain = 'https://bilibili.com';

export default ({ navigation }: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [inputCookieVisible, setInputCookieVisible] = React.useState(false);
  const {
    qrcode,
    loginInfo,
    initialize,
    setQrCode,
    setQrCodeKey,
    setQrCodeExpire,
    setLoginInfo,
    clearQRLogin,
    getBiliLoginStatus,
    getQRLoginReq,
    confirmWebQRCode = () => undefined,
  } = useBiliLogin();

  const manualInputCookies = async (input: { [key: string]: string }) => {
    if (input.SESSDATA.length > 0 && input.bili_jct.length > 0) {
      await CookieManager.set(domain, {
        name: 'SESSDATA',
        value: input.SESSDATA,
      });
      await CookieManager.set(domain, {
        name: 'bili_jct',
        value: input.bili_jct,
      });
      logger.debug(`[setCookie] manually input cookie;`);
      clearQRLogin();
      getBiliLoginStatus();
      // https://github.com/biliup/biliup-rs/issues/75
      // doesnt work:(
      // confirmWebQRCode(input.SESSDATA, input.bili_jct);
    }
    setInputCookieVisible(false);
  };

  const loginPage = () => {
    const generateBiliQRCode = async () => {
      try {
        Snackbar.show({
          text: t('Login.BilibiliLoginQRGeneration'),
          duration: Snackbar.LENGTH_INDEFINITE,
        });
        const qrCodeReq = await getQRLoginReq();
        setQrCode(qrCodeReq.url);
        setQrCodeKey(qrCodeReq.key);
        setQrCodeExpire(qrCodeReq.expire);
        Snackbar.dismiss();
        Snackbar.show({
          text: t('Login.BilibiliLoginQRGenerated'),
        });
      } catch (error) {
        Snackbar.dismiss();
        Snackbar.show({
          text: t('Login.BilibiliLoginQRGenerateFailed'),
        });
        logger.error(`[biliLogin] ${error}`);
      }
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

  const loggedInPage = () => {
    if (!loginInfo) return <></>;
    const logout = () => {
      setLoginInfo(null);
      CookieManager.clearAll();
    };
    return (
      <View style={styles.loggedInContainerStyle}>
        <View style={styles.avatarContainerStyle}>
          <Avatar.Image source={{ uri: loginInfo.avatar }}></Avatar.Image>
          <View style={styles.avatarUsernameStyle}>
            <Text variant="headlineSmall">{loginInfo.name}</Text>
            <Button onPress={logout}>LOGOUT</Button>
          </View>
        </View>
        <BiliSelectFavButtton />
        <Text>{t('Login.Disclaimer')}</Text>
      </View>
    );
  };

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
        loggedInPage()
      ) : (
        loginPage()
      )}
      <GenericInputDialog
        options={['SESSDATA', 'bili_jct']}
        visible={inputCookieVisible}
        title={String(t('Login.BilibiliCookieInputDialogTitle'))}
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
