import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginButton from "./auth/LoginButton.tsx";


const Navbar = () => {
    return (
        <AppBar position="static" color="default">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    QuantCraft
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Button color="inherit" component={RouterLink} to ="/">Home</Button>
                    <Button color="inherit" component={RouterLink} to="/market">Market</Button>
                    <Button color="inherit" component={RouterLink} to="/studio">STUDIO</Button>
                </Box>
                <LoginButton />
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
