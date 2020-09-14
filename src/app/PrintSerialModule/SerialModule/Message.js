import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
}));

export default function CustomizedSnackbars(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("info");
    const [message, setMessage] = React.useState("");

    const handleClose = (event, reason) => {
        setOpen(false);
    };
    React.useEffect(() => {
        setMessage(props.message)
        setType(props.type)
        setOpen(props.open)
    });

    return (
        <div className={classes.root}>
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={type}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
}