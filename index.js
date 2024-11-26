const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, Preview Environment!');
});

const port = process.env.PORT || 3834;
app.listen(port, () => {
    console.log(`Server is running on  http://localhost:${port}`);
});
