import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { parsePDF } from './pdf_parser';
import { matchInvestor } from './matcher';
import { composeEmail } from './email_composer';
import { testPinecone, seedInvestors } from './pinecone';

dotenv.config();

const app: Express = express();
app.use(express.json());

const port = process.env.PORT;
const upload = multer({ dest: 'uploads/' });

app.get('/', async (req: Request, res: Response) => {
  res.send('Express + TypeScript Nodejs Server');
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
        "name": "Marc Andreessen",
        "reason_for_matching": "Andreessen's investment focus ...",
        "compatibility_score": 9
    },
    {
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
      res.status(500).json({ error: 'Failed find any investors' });
    });
});

app.post('/compose-email', async (req: Request, res: Response) => {
  if (!req.body.startup_info) {
    return res.status(400).json({ error: 'No company info given' });
  }

  if (!req.body.investor_info) {
    return res.status(400).json({ error: 'No Investor info given' });
  }

  composeEmail(req.body.startup_info, req.body.investor_info)
    .then((email) => {
      res.json({ email });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to compose email' });
    });
});

app.get('/pinecone-test', async (req: Request, res: Response) => {
  await testPinecone();
  res.send('Done');
});

app.get('/seed-investors', async (req: Request, res: Response) => {
  await seedInvestors();
  res.send('Done');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});