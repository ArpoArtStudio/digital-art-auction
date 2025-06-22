// /server/index.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './socket';
import { supabase } from '../lib/supabase';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Check Supabase connection
  console.log('Checking Supabase connection...');
  
  // Use Promise constructor to handle both resolve and reject paths
  const checkSupabase = async () => {
    try {
      const { count, error } = await supabase.from('chat_messages').select('count()', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error connecting to Supabase:', error.message);
        console.error('Please check your .env.local file for correct Supabase credentials');
      } else {
        console.log(`Connected to Supabase successfully! Found ${count} chat messages.`);
      }
    } catch (err) {
      console.error('Failed to connect to Supabase:', err instanceof Error ? err.message : String(err));
      console.error('Chat will work in file-based fallback mode only');
    }
    
    // Initialize Socket.IO
    initSocketServer(server);

    // Start the server
    server.listen(3000, () => {
      console.log('> Ready on http://localhost:3000');
    });
  };
  
  // Execute the function
  checkSupabase();
});
