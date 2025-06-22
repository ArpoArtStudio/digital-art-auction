"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /server/index.ts
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const socket_1 = require("./socket");
const supabase_1 = require("../lib/supabase");
const dev = process.env.NODE_ENV !== 'production';
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const server = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    // Check Supabase connection
    console.log('Checking Supabase connection...');
    // Use Promise constructor to handle both resolve and reject paths
    const checkSupabase = async () => {
        try {
            const { count, error } = await supabase_1.supabase.from('chat_messages').select('count()', { count: 'exact', head: true });
            if (error) {
                console.error('Error connecting to Supabase:', error.message);
                console.error('Please check your .env.local file for correct Supabase credentials');
            }
            else {
                console.log(`Connected to Supabase successfully! Found ${count} chat messages.`);
            }
        }
        catch (err) {
            console.error('Failed to connect to Supabase:', err instanceof Error ? err.message : String(err));
            console.error('Chat will work in file-based fallback mode only');
        }
        // Initialize Socket.IO
        (0, socket_1.initSocketServer)(server);
        // Start the server
        server.listen(3000, () => {
            console.log('> Ready on http://localhost:3000');
        });
    };
    // Execute the function
    checkSupabase();
});
