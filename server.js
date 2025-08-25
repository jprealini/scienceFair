const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Supabase config
const supabaseUrl = "https://btvzhdvlviipnyevxrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnpoZHZsdmlpcG55ZXZ4cndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjc1MDgsImV4cCI6MjA3MTcwMzUwOH0.JjamX6XBLizR4Pc7uP3JGfxnoaYFZqvWV8a2bwx7DLw";
const supabase = createClient(supabaseUrl, supabaseKey);


// GET all projects from Supabase
app.get('/api/projects', async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


// POST select a project for a family (update selectedBy if not already selected)
app.post('/api/select', async (req, res) => {
  const { projectId, familyName } = req.body;
  // Only update if not already selected
  const { data, error } = await supabase
    .from('projects')
    .update({ selectedBy: familyName })
    .eq('id', projectId)
    .is('selectedBy', null)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(400).json({ error: 'Project already selected or not found' });
  res.json({ success: true, project: data[0] });
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
