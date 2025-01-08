import React from 'react'; 
import { AppBar, Toolbar, Typography, InputBase, Box } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import useStyles from './styles';

const Header = () => {
    const classes = useStyles();

    return (
        <AppBar position='static' className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
                <Typography variant="h5" className={classes.title}>
                    Laari Khojo
                </Typography>
                <Box display="flex">
                { /* <Typography variant="h6" className={classes.title}>
                    Turning Hunger into Adventure!
                </Typography> */ }
                {/* <Autocomplete> */}
                    <div classname={classes.search}>
                        <div className = {classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase placeholder='Search...' classes={{ root: classes.inputRoot, input: classes.inputInput }}/>
                    </div>
                {/* </Autocomplete> */}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 