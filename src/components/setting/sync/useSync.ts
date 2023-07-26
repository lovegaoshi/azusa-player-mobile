import React, { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { loginDropbox, noxBackup, noxRestore } from './DropboxAuth';
import { useNoxSetting } from 'hooks/useSetting';
import { logger } from '@utils/Logger';
import { exportPlayerContent, importPlayerContent } from '@utils/ChromeStorage';
