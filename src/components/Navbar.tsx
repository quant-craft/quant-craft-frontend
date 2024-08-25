import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
    return (
        <AppBar position="static" color="default">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    QuantCraft
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">Services</Button>
                    <Button color="inherit">Pricing</Button>
                    <Button color="inherit">Support</Button>
                </Box>
                <Button color="primary" variant="contained">Login</Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
