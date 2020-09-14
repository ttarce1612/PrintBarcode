/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import { SnackbarProvider, withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

class MyComponent extends React.Component {
  constructor(props) {
    super(props)
    // state = {
    //   message: "",
    //   type: "",
    //   refresh: ""
    // };
  }
  showSnack(data) {
    this.props.enqueueSnackbar(
      data.message,
      { variant: data.type, persist: false, autoHideDuration: 3000 }
    );
  }

  handleBackOnline = () => {
    this.props.closeSnackbar(this.key);
  };

  static getDerivedStateFromProps(nProps) {
    return nProps;
  }

  componentDidUpdate(nState, nProp) { 
    if (this.props.type && this.props.message && this.props.refresh) {
      this.showSnack({ type: this.props.type, message: this.props.message });
    }
  }

  render() { return (<div></div>) };
}

const SnackbarItem = withSnackbar(MyComponent, { a: 1 });

export default function IntegrationNotistack() {

  const classes = useStyles1();
  const [type, setType] = React.useState("info");
  const [message, setMessage] = React.useState("");
  const [refresh, setRefresh] = React.useState("");
  const [isDidmount, setIsDidMount] = React.useState(false);

  if (isDidmount == false) {
    setIsDidMount(true);
    document.addEventListener("toast_message", (e) => {
      if (e.detail && e.detail.message) {
        if (e.detail.type) {
          setType(e.detail.type);
          setMessage(e.detail.message);
        }
        setRefresh(new Date());
      }
    });
  }
  const notistackRef = React.createRef();
  const onClose = key => () => {
    notistackRef.current.closeSnackbar(key);
  }
  return (
    <SnackbarProvider
      ref={notistackRef}
      classes={{
        variantSuccess: classes.success,
        variantError: classes.error,
        variantWarning: classes.warning,
        variantInfo: classes.info,
      }}
      action={(key) => (
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose(key)}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      )}
      maxSnack={3}>
      <SnackbarItem type={type} message={message} refresh={refresh} />
    </SnackbarProvider>
  );
}
