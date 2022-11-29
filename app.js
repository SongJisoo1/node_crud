const express = require('express');

const PORT = 3000;

const postRouter = require('./routes/post.js');
const commentRouter = require('./routes/comment.js');
const connect = require('./schemas/index.js');

const app = express();
connect();

app.use(express.json());


app.use('/posts', postRouter);
app.use('/comments', commentRouter);


app.listen(PORT, () => {
    console.log(`${PORT}포트로 서버가 열림`);
})