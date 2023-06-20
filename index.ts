import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { parsePDF } from './pdf-parser';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const upload = multer({ dest: 'uploads/' });

app.get('/', async (req: Request, res: Response) => {
  res.send('Express + TypeScript Nodejs Server');
});

app.post('/upload-deck', upload.single('deck'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  parsePDF(req.file.path)
    .then(() => {
      // Send a response
      res.json({ message: 'PDF uploaded and parsed successfully' });
    })
    .catch((error) => {
      // Handle any errors that occurred during parsing
      console.error(error);
      res.status(500).json({ error: 'Failed to parse PDF' });
    });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});