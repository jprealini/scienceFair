const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const PROJECTS_FILE = path.join(__dirname, 'projects.json');
let projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));

// GET all projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// POST select a project for a family
app.post('/api/select', (req, res) => {
  const { projectId, familyName } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (project.selectedBy) {
    return res.status(400).json({ error: 'Project already selected' });
  }
  project.selectedBy = familyName;
  // Persist the updated projects array to the JSON file
  fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), err => {
    if (err) {
      project.selectedBy = null; // rollback in-memory change
      return res.status(500).json({ error: 'Failed to save selection' });
    }
    res.json({ success: true, project });
  });
});


// Serve static files from the React app build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'client', 'build');
  app.use(express.static(buildPath));
  // Serve index.html for any unknown routes (for React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
