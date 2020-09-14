
/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import DefaultTheme from './theme/default.json';
const theme = createMuiTheme(DefaultTheme);
export default responsiveFontSizes(theme);