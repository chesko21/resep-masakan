const express = require('express');
const path = require('path');

const app = express();

// Serve static assets
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
