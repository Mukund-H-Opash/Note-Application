// frontend/src/components/loader.tsx
import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image'; // Assuming Image is used for /loadeing.jpg

export default function Loader({ onCancel }: { onCancel?: () => void }) { // onCancel made optional [modified]
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 6,
        px: 4,
        maxWidth: '480px',
        margin: '0 auto',
        
      }}
    >
      <Box>
        <Image src="/loadeing.jpg" alt="Loading" width={150} height={150} style={{ objectFit: 'contain' ,}} />
      </Box>
       
      <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Loading...
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
        Please wait while we fetch your data.
      </Typography>
      {onCancel && ( 
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            mt: 2,
            minWidth: '84px',
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
} 