import React from 'react';
import Image from 'next/image'; // Using Next.js Image for optimized images
import Link from 'next/link';   // Using Next.js Link for client-side navigation
import Header from '@/components/Header';

// MUI Components
import {
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';

const lockIllustrationPath = "/UnauthorizedAccess.jpg"

export default function UnauthorizedPageUpdated() {
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#F5F8FF', 
      display: 'flex',
      flexDirection: 'column',
    }}>
      
      <Header />
      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}>
        <Container
          maxWidth="sm"
          sx={{
            textAlign: 'center',
            backgroundColor: 'white',
            padding: { xs: 3, sm: 4, md: 6 },
            borderRadius: '12px', // Slightly larger border radius
            boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', // Refined shadow
          }}
        >
          <Box sx={{
            backgroundColor: '#FFF4E5', // Light orange background from image
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3, // Adjusted padding if needed
            mb: 3,
            width: { xs: 140, sm: 160 }, 
            height: { xs: 140, sm: 160 },
          }}>
            
            <Image
              src={lockIllustrationPath}
              alt="Unauthorized Access Illustration"
              width={220} 
              height={220}
              style={{ objectFit: 'contain' }}
            />
            
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 'bold', color: 'grey.800', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Unauthorized Access
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'grey.600',
              mb: 4,
              lineHeight: 1.7,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              maxWidth: '450px', 
              mx: 'auto'
            }}
          >
            You do not have permission to view this page. Please log in or contact
            your administrator for assistance.
          </Typography>
          <Link href="/" passHref>
            <Button
              
              variant="contained"
              sx={{
                backgroundColor: '#5B6DFF', 
                color: 'white',
                padding: { xs: '10px 24px', sm: '12px 32px' },
                borderRadius: '9999px', 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 500, 
                boxShadow: '0px 2px 8px rgba(91, 109, 255, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#4a5ce0', 
                  boxShadow: '0px 4px 12px rgba(91, 109, 255, 0.4)',
                },
              }}
            >
              Go to Home
            </Button>
          </Link>
        </Container>
      </Box>
    </Box>
  );
}