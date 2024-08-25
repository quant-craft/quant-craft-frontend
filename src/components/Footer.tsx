import { Typography, Box } from '@mui/material';

const Footer = () => {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
            <Typography variant="body2" color="text.secondary" align="center">
                © 2024 QuantCraft. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
