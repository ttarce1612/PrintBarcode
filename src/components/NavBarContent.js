/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const dispatcher = require('./../libs/dispatcher');

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        position: 'absolute',
        marginLeft: theme.navbarLeft.width + 30,
        marginTop: 60,
        width: (window.innerWidth - (theme.navbarLeft.width + 60))
    },
    contentShift: {
        marginLeft: 30,
        width: (window.innerWidth - 60)
    }
}));

export default function NavBarContent(props, v) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    //Register event
    dispatcher.register('nav_bar_toogle.content', (payload) => {
        setOpen(!open);
    });

    //un-Mount component
    React.useEffect(() => {
        return () => {
            // dispatcher.destroy('nav_bar_toogle.content');
        };
      }, []);

    return (<main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
        {props.children}
    </main>)
}