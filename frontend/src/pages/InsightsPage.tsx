import React from 'react';
import { Box, Container, Typography, Card, Chip } from '@mui/material';
// import Navbar from '../components/Navbar';

interface Insight {
  id: number;
  investor: string;
  ticker: string;
  title: string;
  description: string;
  tag: string;
  imageUrl: string;
}

const insights: Insight[] = [
  {
    id: 1,
    investor: 'BILL ACKMAN',
    ticker: 'GOOGL',
    title: 'Flamante nueva versión de Gemini enciende la acción de Alphabet',
    description: '',
    tag: 'LANZAMIENTO',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Sundar_Pichai_-_2023_%28cropped%29.jpg'
  },
  {
    id: 2,
    investor: 'NANCY PELOSI',
    ticker: 'APPL',
    title: 'Pelosi Index: cómo la expresidenta de la Cámara de Reprepresentantes de EEUU se convirtió en un referente del mercado accionario [DF]',
    description: '',
    tag: 'LANZAMIENTO',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Official_photo_of_Speaker_Nancy_Pelosi_in_2019.jpg/330px-Official_photo_of_Speaker_Nancy_Pelosi_in_2019.jpg'
  },
  {
    id: 3,
    investor: 'XI JINPING',
    ticker: 'FTSE China A50',
    title: '¿Llegó el momento de China? Lo que nos dicen sus resultados corporativos [Fintualist]',
    description: '',
    tag: 'LANZAMIENTO',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Xi_Jinping_2025_%28cropped%29.jpg/500px-Xi_Jinping_2025_%28cropped%29.jpg'
  }
];

const InsightsPage: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', pb: 8 }}>
      {/* <Navbar /> */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
          Insights 
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {insights.map((insight) => (
            <Card key={insight.id} sx={{ display: 'flex', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #FFE0D6', backgroundColor: '#FFF5F2', height: 250 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 4, justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: '#B85C3E', mb: 1, letterSpacing: 1, fontSize: '0.8rem', fontWeight: 500 }}>
                  {insight.investor} <span style={{ color: '#E8A890' }}>|</span> {insight.ticker}
                </Typography>
                <Typography variant="h5" component="h2" sx={{ color: '#000', fontWeight: 'bold', mb: 2, lineHeight: 1.2 }}>
                  {insight.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#8B5E4A', mb: 3 }}>
                  {insight.description}
                </Typography>
                <Box>
                  <Chip 
                    label={insight.tag} 
                    sx={{ 
                      backgroundColor: '#BBDEFB', 
                      color: '#1976D2', 
                      fontWeight: 'bold',
                      borderRadius: 2,
                      height: 32
                    }} 
                  />
                </Box>
              </Box>
              <Box 
                sx={{ 
                  width: 300, 
                  backgroundImage: `url(${insight.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: { xs: 'none', md: 'block' }
                }} 
              />
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default InsightsPage;
