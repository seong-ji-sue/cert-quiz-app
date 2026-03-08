import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.NODE_SERVER_PORT || 4010;

app.use(cors({origin: '*', credentials: true}));
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello from cert-quiz-app backend!');
});

app.listen(port, () => {
	console.log(`Backend server is running at http://localhost:${port}`);
});
