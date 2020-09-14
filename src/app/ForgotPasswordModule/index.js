/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Logo from '../../assets/logo/logo.png';
import ForgotPasswordForm from './Component/ForgotPasswordForm';

const useStyles = makeStyles((theme) => createStyles({
  card: {
    minWidth: 275,
    maxWidth: 330,
    position: 'relative',
    top: '20vh',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.secondary.main,
    margin: 8
  },
  logo: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  cardContent: {
    padding: 8
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    letterSpacing: theme.typography.body1.letterSpacing,
    lineHeight: theme.typography.body1.lineHeight,
    textAlign: 'center'
  },
  pos: {
    marginBottom: 12,
  },
}));

export default function ForgotPassword(props) {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
      <Avatar alt="Remy Sharp" src={Logo} className={classes.logo} />
        <Typography className={classes.title} color="textPrimary" gutterBottom>
          <span style={{marginTop: 'auto', marginBottom: 'auto'}}>Forgot Password</span>
        </Typography>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
