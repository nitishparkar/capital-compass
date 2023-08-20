import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import morgan from 'morgan';
import { parsePDF } from './pdf_parser';
import { matchInvestor } from './matcher';
import { composeEmail } from './email_composer';
import { testPinecone } from './pinecone';
import { testStreaming } from './openai';
import { testFirebase } from './firebase';
import { initializeApp, cert } from 'firebase-admin/app';

dotenv.config();

const app: Express = express();
app.use(morgan('default'));
app.use(express.json());

const port = process.env.PORT;
const upload = multer({ dest: 'uploads/' });

const serviceAccount = require('../keys.json');
initializeApp({
  credential: cert(serviceAccount)
});

app.get('/', async (req: Request, res: Response) => {
  res.send('Capital Compass API is up.');
});

/*
{
  "summary": "UberCab is a luxury on-demand car...",
  "qna": [
    {
      "question": "Question",
      "answer": "Ans"
    },
    {
      "question": "Another Q",
      "answer": "Ans"
    }
  ],
  "info": "parsed pdf content",
  "need_user_input": false
}
*/
app.post('/upload-deck', upload.single('deck'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  parsePDF(req.file.path)
    .then((content) => {
      res.json(content);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to parse PDF' });
    });
});



/*
{
  "investors": [
    {
        "id": "AoPR8MMJBP54iyyz3sXq",
        "name": "Marc Andreessen",
        "reason_for_matching": "Andreessen's investment focus ...",
        "compatibility_score": 9
    },
    {
        "id": "LxsvvVYKVV9ZK93bloNm",
        "name": "Alexis Ohanian",
        "reason_for_matching": "Ohanian's investment Thesis...",
        "compatibility_score": 7
    }
  ]
}
*/
app.post('/match-investors', async (req: Request, res: Response) => {
  if (!req.body.startup_info) {
    return res.status(400).json({ error: 'No startup info given' });
  }

  matchInvestor(req.body.startup_info)
    .then((investors) => {
      res.json({ investors });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to find investors' });
    });
});

/*
{
  "email": "Dear ..."
}
*/
app.post('/compose-email', async (req: Request, res: Response) => {
  if (!req.body.startup_info) {
    return res.status(400).json({ error: 'Missing startup info' });
  }

  if (!req.body.investor) {
    return res.status(400).json({ error: 'Missing investor info' });
  }

  composeEmail(req.body.startup_info, req.body.investor)
    .then((email) => {
      res.json({ email });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to compose email' });
    });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/pinecone-test', async (req: Request, res: Response) => {
    await testPinecone();
    res.send('Done');
  });

  app.get('/streaming-test', async (req: Request, res: Response) => {
    await testStreaming(res);
    res.end();
  });

  app.get('/firebase-test', async (req: Request, res: Response) => {
    await testFirebase();
    res.end();
  });
}

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}, in ${process.env.NODE_ENV} env`);
});