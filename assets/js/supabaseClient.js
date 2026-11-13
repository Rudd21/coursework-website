const supabaseUrl = "https://agqxjwyhrmbyxuexrktp.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncXhqd3locm1ieXh1ZXhya3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDAwOTMsImV4cCI6MjEwNzk3NjA5M30.Yys8EXvqNEzCFEkuxQofp_Z3tlcjllXYr0XSlPbUT3k";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

window.supabaseClient = supabaseClient;

console.log("Supabase ініціалізовано успішно!");