import axios from 'axios';
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', async (req, res) => {
  // console.log(req.originalUrl);
  const url = decodeURIComponent(req.originalUrl.substring(6));
  // console.log(url);
  
  try {
    // axios automaticky parsne response body (ktory je pre LUM a FEU text a pre MLA a NOST json)
    const response = await axios.get(url);
    // console.log(response);
    const data = response.data;
    // console.log(data);
    res.send(data);
  } catch {
    res.status(500).json({ message: 'Error accessing the URL' });
  }
});

export const handler = serverless(app);
